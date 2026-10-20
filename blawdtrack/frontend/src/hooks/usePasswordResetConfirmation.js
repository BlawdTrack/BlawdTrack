import { useState } from 'react';
import { confirmPasswordReset } from '../services/PasswordRecoveryService';
import { meetsClientPasswordRules } from '../utils/passwordRules';
import { describeConfirmError, PASSWORD_RESET_MESSAGES } from '../utils/passwordResetErrors';

/**
 * Estado y envío del formulario "Crear nueva contraseña" (HU-002): los dos campos, las reglas del cliente, la
 * llamada a `confirmPasswordReset` y lo que sigue a cada resultado (éxito, enlace vencido, contraseña reutilizada).
 * @param {string} token Token del enlace del correo.
 * @returns {{ newPassword: string, confirmPassword: string, loading: boolean,
 *   error: { message: string, field?: string }|null, historyRejected: boolean, tokenRejected: boolean,
 *   succeeded: boolean, confirmMismatch: boolean, canSubmit: boolean, onNewPasswordChange: Function,
 *   onConfirmPasswordChange: Function, onSubmit: Function }}
 */
export function usePasswordResetConfirmation(token) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyRejected, setHistoryRejected] = useState(false);
  const [tokenRejected, setTokenRejected] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  // La coincidencia se avisa en vivo bajo la confirmación y el botón se habilita cuando todo es válido.
  const confirmMismatch = confirmPassword !== '' && newPassword !== confirmPassword;
  const canSubmit = meetsClientPasswordRules(newPassword) && confirmPassword !== '' && !confirmMismatch;

  const clearFeedback = () => {
    if (error) setError(null);
  };

  const onNewPasswordChange = (event) => {
    setNewPassword(event.target.value);
    clearFeedback();
    // La regla 4 solo se marcó como no cumplida para la contraseña rechazada;
    // con otra contraseña vuelve a "pendiente".
    setHistoryRejected(false);
  };

  const onConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
    clearFeedback();
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    if (!meetsClientPasswordRules(newPassword)) {
      setError({ message: PASSWORD_RESET_MESSAGES.rules, field: 'newPassword' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setError({ message: PASSWORD_RESET_MESSAGES.mismatch, field: 'confirmPassword' });
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await confirmPasswordReset(token, newPassword);
      // La contraseña ya no se necesita en memoria.
      setNewPassword('');
      setConfirmPassword('');
      setSucceeded(true);
    } catch (err) {
      const outcome = describeConfirmError(err);
      if (outcome.tokenRejected) setTokenRejected(true);
      if (outcome.historyRejected) setHistoryRejected(true);
      if (outcome.error) setError(outcome.error);
    } finally {
      setLoading(false);
    }
  };

  return {
    newPassword,
    confirmPassword,
    loading,
    error,
    historyRejected,
    tokenRejected,
    succeeded,
    confirmMismatch,
    canSubmit,
    onNewPasswordChange,
    onConfirmPasswordChange,
    onSubmit,
  };
}

export default usePasswordResetConfirmation;
