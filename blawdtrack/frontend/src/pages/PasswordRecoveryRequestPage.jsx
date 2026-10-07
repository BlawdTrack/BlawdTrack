import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Link,
} from '@mui/material';
import { requestPasswordReset } from '../services/PasswordRecoveryService';
import { Toast } from '../components/Toast';
import { RecoverySteps } from '../components/RecoverySteps';
import HelpTip from '../components/HelpTip';
import AuthCardLayout from '../components/AuthCardLayout';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';

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

const TITLE_SX = {
  fontFamily: '"Poppins", sans-serif',
  fontWeight: 600,
  fontSize: 18,
  color: 'primary.main',
};

const LINK_SX = { fontSize: 12, fontWeight: 600, color: 'primary.main' };

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
  const [toast, setToast] = useState({ open: false, message: '', severity: 'error' });

  const closeToast = () => setToast((previous) => ({ ...previous, open: false }));

  const handleChange = (event) => {
    setEmail(event.target.value);
    if (fieldErrors.email) setFieldErrors({ email: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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

  const backToLoginLink = (
    <Link
      component="button"
      type="button"
      onClick={() => onBackToLogin?.()}
      underline="hover"
      sx={{ ...LINK_SX, color: '#6B6560' }}
    >
      Volver a iniciar sesión
    </Link>
  );

  return (
    <AuthCardLayout>
      <RecoverySteps current={sentEmail ? 2 : 1} />

      <Box sx={{ p: { xs: '24px 16px', sm: '32px' }, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: '100%', maxWidth: 460 }}>
          {sentEmail === null ? (
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <Typography component="h1" sx={TITLE_SX}>
                Solicitar enlace de restablecimiento
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  component="label"
                  htmlFor="recovery-email"
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    color: '#6B6560',
                  }}
                >
                  Correo electrónico registrado
                </Typography>
                <HelpTip label="¿Qué se valida al enviar el enlace?" sx={{ width: 32, height: 32, my: '-6px' }}>
                  Validamos que la cuenta exista y esté activa antes de enviar el correo.
                </HelpTip>
                </Box>
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
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff', fontSize: 16 },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#DCD4CA', borderWidth: '1.5px' },
                  }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ borderRadius: '10px', minHeight: 48, fontWeight: 600, fontSize: 16 }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: 'inherit' }} /> : 'Enviar enlace'}
              </Button>

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>{backToLoginLink}</Box>
            </Box>
          ) : (
            <Box
              role="status"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <Box
                aria-hidden
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: '#E9F3EC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MarkEmailReadOutlinedIcon sx={{ fontSize: 28, color: '#2F7D4F' }} />
              </Box>

              <Typography component="h1" sx={TITLE_SX}>
                Revisa tu correo
              </Typography>

              {/* Redacción condicional a propósito: el backend no confirma si la
                  cuenta existe o está activa, así que no se afirma un envío.
                  Tampoco se menciona un tiempo de expiración concreto. */}
              <Typography sx={{ fontSize: 14, color: '#6B6560', lineHeight: 1.55 }}>
                Si{' '}
                <Box component="strong" sx={{ color: '#1F2421', overflowWrap: 'anywhere' }}>
                  {sentEmail}
                </Box>{' '}
                está registrado y activo, recibirás un enlace para restablecer tu contraseña. El
                enlace solo puede usarse una vez.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: 14, color: '#6B6560' }}>¿No te llega el correo?</Typography>
                <HelpTip label="¿Cuánto tarda en llegar el correo?">El correo suele llegar en menos de 2 minutos, pero puede tardar hasta 5. Si no lo ves, revisa la carpeta de correo no deseado.</HelpTip>
              </Box>

              <Link
                component="button"
                type="button"
                onClick={handleUseAnotherEmail}
                underline="always"
                sx={LINK_SX}
              >
                Usar otro correo
              </Link>

              {backToLoginLink}
            </Box>
          )}
        </Box>
      </Box>
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={closeToast} />
    </AuthCardLayout>
  );
}

export default PasswordRecoveryRequestPage;
