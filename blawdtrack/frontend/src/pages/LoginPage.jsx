import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Link,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { StatusMessage } from '../components/StatusMessage';
import PasswordField from '../components/PasswordField';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { LINK_BUTTON_SX } from '../components/formStyles';
import { FIELD_LABEL_SX, FIELD_SX, AUTH_BUTTON_SX } from '../components/authStyles';
import { FONT, fontPx } from '../theme';
import AuthSplitLayout from '../components/AuthSplitLayout';
import { validateEmail } from '../utils/emailRules';

function validateForm(data) {
  const errors = { email: validateEmail(data.email), password: '' };

  if (!data.password) {
    errors.password = 'La contraseña es obligatoria.';
  }

  return errors;
}

/**
 * Pantalla de inicio de sesión (HU-001). Valida correo y contraseña en el cliente y, si son válidos,
 * llama a `login` del contexto de autenticación.
 * @param {{ onLoginSuccess?: Function, onSubmitAttempt?: Function, onForgotPassword?: Function }} props
 *   `onLoginSuccess` se ejecuta con la respuesta del login; `onForgotPassword` abre la recuperación.
 */
export function LoginPage({ onLoginSuccess, onSubmitAttempt, onForgotPassword }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const { login, loading, error, resetError } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previousData) => ({ ...previousData, [name]: value }));
    if (error) resetError();
    if (fieldErrors[name]) {
      setFieldErrors((previousErrors) => ({ ...previousErrors, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateForm(formData);
    setFieldErrors(errors);
    if (errors.email || errors.password) {
      // Se detiene aquí: no se llama a login() ni se dispara onSubmitAttempt,
      // así que nunca se envía una petición al backend con datos incompletos
      // o un correo con formato inválido (T04).
      return;
    }

    onSubmitAttempt?.();
    try {
      const response = await login(formData.email, formData.password);
      onLoginSuccess?.(response);
    } catch {
      // El mensaje de error ya queda reflejado por el AuthContext.
    }
  };

  return (
    <AuthSplitLayout
      brandTitle={
        <>
          Cada entrega,
          <br />
          siempre <Box component="span" sx={{ color: 'secondary.main' }}>a la vista.</Box>
        </>
      }
      brandSubtitle="Gestiona mensajeros, rutas y paquetes de Blawd Gourmet desde un solo lugar."
    >
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            component="h1"
            sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: fontPx(36), lineHeight: 1.15, color: 'primary.main' }}
          >
            Iniciar sesión
          </Typography>
          <Typography sx={{ fontSize: FONT.lg, color: 'text.secondary', mt: 1.5, lineHeight: 1.5 }}>
            Ingresa con tu correo y contraseña. El sistema te llevará al panel de tu rol.
          </Typography>
        </Box>

        {error && <StatusMessage severity={error.severity} message={error.message} />}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography component="label" htmlFor="login-email" sx={FIELD_LABEL_SX}>
            Correo electrónico
          </Typography>
          <TextField
            fullWidth
            required
            id="login-email"
            name="email"
            type="email"
            placeholder="nombre@blawdgourmet.com"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
            sx={FIELD_SX}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography component="label" htmlFor="login-password" sx={FIELD_LABEL_SX}>
            Contraseña
          </Typography>
          <PasswordField
            fullWidth
            required
            id="login-password"
            name="password"
            placeholder="Tu contraseña"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password}
            sx={FIELD_SX}
          />
          <Link
            component="button"
            type="button"
            onClick={() => onForgotPassword?.()}
            data-testid="login-forgot-password"
            underline="hover"
            sx={{ ...LINK_BUTTON_SX, alignSelf: 'center', mt: 0.5, color: 'secondary.text', fontWeight: 700, fontSize: FONT.md }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          data-testid="login-submit"
          disabled={loading}
          startIcon={loading ? null : <LoginOutlinedIcon />}
          sx={AUTH_BUTTON_SX}
        >
          {loading ? <CircularProgress size={24} sx={{ color: 'inherit' }} /> : 'Iniciar sesión'}
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
          <LockOutlinedIcon sx={{ fontSize: FONT.lg, color: 'text.secondary', mt: '0.2rem', flexShrink: 0 }} />
          <Typography sx={{ fontSize: FONT.md, color: 'text.secondary', lineHeight: 1.45 }}>
            Requiere conexión a internet. Tus contraseñas se guardan encriptadas.
          </Typography>
        </Box>
      </Box>
    </AuthSplitLayout>
  );
}

export default LoginPage;
