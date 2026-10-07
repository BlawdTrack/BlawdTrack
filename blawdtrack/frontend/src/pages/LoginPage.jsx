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
import blawdtrackLogo from '../assets/Logo.png';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LABEL_SX = {
  fontSize: 12,
  fontWeight: 600,
  color: 'text.secondary',
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
};

function validateForm(data) {
  const errors = { email: '', password: '' };

  if (!data.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Ingresa un correo electrónico con un formato válido.';
  }

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
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {/* Panel de marca: solo en escritorio, para no quitarle espacio al formulario en móvil. */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: '0 0 42%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          p: 6,
          borderRight: '4px solid',
          borderColor: 'secondary.main',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src={blawdtrackLogo} alt="BlawdTrack" style={{ width: 28, height: 34, objectFit: 'contain' }} />
          </Box>
          <Typography variant="h6" component="span">
            BlawdTrack
          </Typography>
        </Box>

        <Box>
          <Typography variant="h4" component="p" sx={{ lineHeight: 1.25, mb: 2 }}>
            Cada entrega, siempre a la vista.
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.75)', maxWidth: 360 }}>
            Gestiona mensajeros, rutas y paquetes de Blawd Gourmet desde un solo lugar.
          </Typography>
        </Box>

        <Box sx={{ width: 48, height: 4, borderRadius: 2, bgcolor: 'secondary.main' }} />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2.5, sm: 4 },
          py: 4,
        }}
      >
        {/* En móvil el panel de marca no se ve, así que la marca va sobre el formulario. */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.25, mb: 4 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src={blawdtrackLogo} alt="BlawdTrack" style={{ width: 24, height: 29, objectFit: 'contain' }} />
          </Box>
          <Typography variant="h6" component="span" sx={{ color: 'primary.main' }}>
            BlawdTrack
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            width: '100%',
            maxWidth: 420,
            bgcolor: 'background.paper',
            border: '1px solid #E4DED7',
            borderRadius: '16px',
            p: { xs: 3, sm: 4.5 },
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="h5" component="h1" sx={{ color: 'primary.main' }}>
              Iniciar sesión
            </Typography>
            <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: 0.75 }}>
              Ingresa con tu correo y contraseña. El sistema te llevará al panel de tu rol.
            </Typography>
          </Box>

          {error && <StatusMessage severity={error.severity} message={error.message} />}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Typography component="label" htmlFor="login-email" sx={LABEL_SX}>
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
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Typography component="label" htmlFor="login-password" sx={LABEL_SX}>
              Contraseña
            </Typography>
            <PasswordField
              fullWidth
              required
              id="login-password"
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password}
            />
            <Link
              component="button"
              type="button"
              onClick={() => onForgotPassword?.()}
              underline="hover"
              sx={{ alignSelf: 'flex-end', color: 'primary.main', fontWeight: 600, fontSize: 14, mt: 0.5 }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ fontWeight: 'bold', fontSize: 16, minHeight: 48, display: 'flex', gap: '10px' }}
          >
            {loading ? (
              <CircularProgress size={22} sx={{ color: 'inherit' }} />
            ) : (
              <>
                <span>Iniciar sesión</span>
                <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: 'secondary.main' }} />
              </>
            )}
          </Button>

          {/* '#2F7D4F' es el mismo verde de éxito que usa StatusMessage.jsx;
              el theme no define theme.palette.success, así que se repite el
              valor fijo en vez de inventar un token nuevo. */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2F7D4F', flexShrink: 0 }} />
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              Conexión a internet requerida · contraseñas encriptadas
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage;
