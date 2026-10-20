import { useState } from 'react';
import { MAIL_RESEND_WAIT_SECONDS } from '../components/MailWaitIndicator';
import { requestPasswordReset } from '../services/PasswordRecoveryService';
import { validateEmail } from '../utils/emailRules';
import { describeRequestError } from '../utils/passwordResetErrors';
import { useCountdown } from './useCountdown';
import { useToast } from './useToast';

/**
 * Estado y envío de la solicitud del enlace de restablecimiento (HU-002 / T04): el correo, su validación en el
 * cliente, la llamada a `requestPasswordReset`, el reenvío con espera y el aviso de falla.
 *
 * El endpoint responde SIEMPRE 200 con el mismo mensaje, exista o no la cuenta y esté o no activa (diseño
 * anti-enumeración del backend), así que tras enviar hay un único resultado posible. `sentEmail` decide la vista:
 * `null` es el formulario y con valor es la confirmación "Revisa tu correo".
 * @returns {{ email: string, emailError: string, loading: boolean, sentEmail: string|null,
 *   resendWait: ReturnType<typeof useCountdown>, toast: object, closeToast: Function, onEmailChange: Function,
 *   onSubmit: Function, onResend: Function, onUseAnotherEmail: Function }}
 */
export function usePasswordRecoveryRequest() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState(null);
  const resendWait = useCountdown(MAIL_RESEND_WAIT_SECONDS);
  const { toast, notify, close: closeToast } = useToast();

  const onEmailChange = (event) => {
    setEmail(event.target.value);
    if (emailError) setEmailError('');
  };

  // Pide el enlace al correo indicado y, si sale bien, arranca la espera del reenvío.
  const request = async (address, onSent) => {
    setLoading(true);
    try {
      await requestPasswordReset(address);
      onSent?.();
      resendWait.start();
    } catch (err) {
      notify(describeRequestError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (resendWait.running) return;

    const error = validateEmail(email);
    setEmailError(error);
    // No se llama al servicio con un correo vacío o con formato inválido.
    if (error) return;

    const submittedEmail = email.trim();
    await request(submittedEmail, () => setSentEmail(submittedEmail));
  };

  // "Reenviar enlace": repite la solicitud al mismo correo, una vez pasada la espera.
  const onResend = async () => {
    if (resendWait.running || loading) return;
    await request(sentEmail);
  };

  // "Usar otro correo": vuelve al formulario conservando lo escrito para poder corregirlo.
  const onUseAnotherEmail = () => {
    setSentEmail(null);
    setEmailError('');
  };

  return {
    email,
    emailError,
    loading,
    sentEmail,
    resendWait,
    toast,
    closeToast,
    onEmailChange,
    onSubmit,
    onResend,
    onUseAnotherEmail,
  };
}

export default usePasswordRecoveryRequest;
