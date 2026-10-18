import { useState } from 'react';
import { useCountdown } from '../hooks/useCountdown';
import AuthStateHeader from '../components/AuthStateHeader';
import AuthSplitLayout from '../components/AuthSplitLayout';
import RecoveryProgress from '../components/RecoveryProgress';
import { MAIL_RESEND_WAIT_SECONDS } from '../components/MailWaitIndicator';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Link,
} from '@mui/material';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import { requestPasswordReset } from '../services/PasswordRecoveryService';
import { Toast } from '../components/Toast';
import { LINK_BUTTON_SX } from '../components/formStyles';
import { FIELD_LABEL_SX, FIELD_SX, AUTH_BUTTON_SX, FOCUS_RING_SX } from '../components/authStyles';
import { formatClock } from '../utils/formatClock';
import { FONT } from '../theme';

// Mismo patrón de validación de cliente que LoginPage.jsx (T04 de HU-001):
// `fieldErrors` por campo, correo obligatorio con trim y formato válido, y
// si hay errores no se llama al servicio.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(data) {
  const errors = { email: '' };

  if (!data.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Ingresa un correo electrónico con un formato válido.';
  }

  return errors;
}

// Textos propios del frontend para fallas reales (no se muestra el `message`
// crudo del backend, que viene en otro idioma).
const CONNECTION_ERROR_MESSAGE =
  'No pudimos conectar con el servidor. Revisa tu conexión a internet e intenta de nuevo.';
const GENERIC_ERROR_MESSAGE = 'No se pudo procesar la solicitud. Intenta de nuevo en unos minutos.';

const BRAND_TITLE = (
  <>
    Recupera tu acceso
    <br />
    <Box component="span" sx={{ color: 'secondary.main' }}>en 3 pasos.</Box>
  </>
);
const BRAND_SUBTITLE = 'Te enviamos un enlace de un solo uso al correo de tu cuenta.';

// T04 de HU-002 (#65): solicitud del enlace de restablecimiento. Es UNA
// pantalla con dos vistas del mismo flujo (r1 y r2 del bloque `hu002` del
// mockup): el formulario y la confirmación "Revisa tu correo". `sentEmail`
// decide cuál se ve: null = formulario, con valor = confirmación.
//
// El endpoint (POST /v1/auth/password-reset/request) responde SIEMPRE 200
// con el mismo mensaje, exista o no la cuenta y esté o no activa (diseño
// anti-enumeración del backend). Por eso hay un único resultado posible tras
// enviar: no se distingue "cuenta inactiva" ni "correo no registrado" (eso
// del mockup, `resetScenarios`, es solo de la demo interactiva).
/**
 * Pantalla "Recuperar contraseña" (HU-002): pide el correo y muestra la confirmación "Revisa tu correo".
 * @param {{ onBackToLogin: Function }} props
 */
export function PasswordRecoveryRequestPage({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '' });
  const [loading, setLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState(null);
  const resendWait = useCountdown(MAIL_RESEND_WAIT_SECONDS);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'error' });

  const closeToast = () => setToast((previous) => ({ ...previous, open: false }));

  const handleChange = (event) => {
    setEmail(event.target.value);
    if (fieldErrors.email) setFieldErrors({ email: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (resendWait.running) return;

    const errors = validateForm({ email });
    setFieldErrors(errors);
    if (errors.email) {
      // No se llama al servicio con un correo vacío o con formato inválido.
      return;
    }

    const submittedEmail = email.trim();
    setLoading(true);
    try {
      await requestPasswordReset(submittedEmail);
      setSentEmail(submittedEmail);
      resendWait.start();
    } catch (err) {
      setToast({
        open: true,
        message: err.response ? GENERIC_ERROR_MESSAGE : CONNECTION_ERROR_MESSAGE,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // "Reenviar enlace": repite la solicitud al mismo correo, una vez pasada la espera.
  const handleResend = async () => {
    if (resendWait.running || loading) return;
    setLoading(true);
    try {
      await requestPasswordReset(sentEmail);
      resendWait.start();
    } catch (err) {
      setToast({
        open: true,
        message: err.response ? GENERIC_ERROR_MESSAGE : CONNECTION_ERROR_MESSAGE,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // "Usar otro correo": vuelve al formulario conservando lo escrito para poder
  // corregirlo.
  const handleUseAnotherEmail = () => {
    setSentEmail(null);
    setFieldErrors({ email: '' });
  };

  return (
    <AuthSplitLayout brandTitle={BRAND_TITLE} brandSubtitle={BRAND_SUBTITLE}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <RecoveryProgress current={sentEmail ? 2 : 1} onBackToLogin={onBackToLogin} />

        {sentEmail === null ? (
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            <AuthStateHeader
              icon={VpnKeyOutlinedIcon}
              title="Recuperar contraseña"
              description="Escribe el correo de tu cuenta y te enviaremos un enlace para elegir una nueva."
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography component="label" htmlFor="recovery-email" sx={FIELD_LABEL_SX}>
                Correo electrónico registrado
              </Typography>
              <TextField
                id="recovery-email"
                fullWidth
                required
                name="email"
                type="email"
                placeholder="nombre@blawdgourmet.com"
                autoComplete="email"
                value={email}
                onChange={handleChange}
                disabled={loading}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
                sx={FIELD_SX}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              endIcon={loading ? null : <ArrowForwardOutlinedIcon />}
              sx={AUTH_BUTTON_SX}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'inherit' }} /> : 'Enviar enlace'}
            </Button>
          </Box>
        ) : (
          <Box role="status" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AuthStateHeader
              icon={MarkEmailReadOutlinedIcon}
              tone="success"
              title="Revisa tu correo"
              description={(
                <>
                  {/* Redacción condicional a propósito: el backend no confirma si la cuenta existe o está
                      activa, así que no se afirma un envío. Tampoco se menciona un tiempo de expiración. */}
                  Si{' '}
                  <Box component="strong" sx={{ color: 'text.primary', overflowWrap: 'anywhere' }}>
                    {sentEmail}
                  </Box>{' '}
                  está registrado y activo, recibirás un enlace para restablecer tu contraseña. El
                  enlace solo puede usarse una vez.
                </>
              )}
            />

            <Button
              fullWidth
              variant="outlined"
              onClick={handleResend}
              disabled={loading || resendWait.running}
              sx={AUTH_BUTTON_SX}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'inherit' }} />
              ) : resendWait.running ? (
                `Reenviar en ${formatClock(resendWait.remaining)}`
              ) : (
                'Reenviar enlace'
              )}
            </Button>

            <Typography sx={{ fontSize: FONT.lg, color: 'text.secondary' }}>
              ¿No te llega? Revisa spam o promociones.
            </Typography>

            <Link
              component="button"
              type="button"
              onClick={handleUseAnotherEmail}
              underline="always"
              sx={{ ...LINK_BUTTON_SX, ...FOCUS_RING_SX, alignSelf: 'flex-start', minHeight: 44, fontSize: FONT.lg, fontWeight: 700, color: 'primary.main' }}
            >
              Usar otro correo
            </Link>
          </Box>
        )}
      </Box>
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={closeToast} />
    </AuthSplitLayout>
  );
}

export default PasswordRecoveryRequestPage;
