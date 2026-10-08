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
import { INLINE_LABEL_SX, LINK_BUTTON_SX } from '../components/formStyles';
import { CARD_PATTERN_SX, RADIUS, FONT, TOUCH_TARGET, rem } from '../theme';
import BrandLogo from '../components/BrandLogo';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
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
        <BrandLogo variant="stackedCream" width={150} />

        <Box>
          <Typography variant="h4" component="p" sx={{ lineHeight: 1.25, mb: 2 }}>
            Cada entrega,
            <br />
            siempre a la vista.
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.75)', maxWidth: rem(290) }}>
            Gestiona mensajeros, rutas y paquetes de Blawd Gourmet desde un solo lugar.
          </Typography>
        </Box>

        <Box sx={{ width: rem(38), height: 4, borderRadius: 2, bgcolor: 'secondary.main' }} />
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
        <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 2 }}>
          <BrandLogo variant="stacked" width={104} />
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            width: '100%',
            maxWidth: rem(340),
            ...CARD_PATTERN_SX,
            border: '1px solid', borderColor: 'neutral.border',
            borderRadius: RADIUS.md,
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
            <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary', mt: 0.75 }}>
              Ingresa con tu correo y contraseña. El sistema te llevará al panel de tu rol.
            </Typography>
          </Box>

          {error && <StatusMessage severity={error.severity} message={error.message} />}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.3846rem' }}>
            <Typography component="label" htmlFor="login-email" sx={INLINE_LABEL_SX}>
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

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.3846rem' }}>
            <Typography component="label" htmlFor="login-password" sx={INLINE_LABEL_SX}>
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
              sx={{ ...LINK_BUTTON_SX, alignSelf: 'flex-end', mr: -1, color: 'primary.main', fontWeight: 600, fontSize: FONT.sm }}
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
            sx={{ fontWeight: 'bold', fontSize: FONT.md, minHeight: TOUCH_TARGET, display: 'flex', gap: '0.6154rem' }}
          >
            {loading ? (
              <CircularProgress size={22} sx={{ color: 'inherit' }} />
            ) : (
              <>
                <span>Iniciar sesión</span>
                <Box sx={{ width: rem(14), height: rem(14), borderRadius: '50%', bgcolor: 'secondary.main' }} />
              </>
            )}
          </Button>

          {/* 'success.main' es el mismo verde de éxito que usa StatusMessage.jsx;
              el theme no define theme.palette.success, así que se repite el
              valor fijo en vez de inventar un token nuevo. */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main', flexShrink: 0 }} />
            <Typography sx={{ fontSize: FONT.xs, color: 'text.secondary' }}>
              Conexión a internet requerida · contraseñas encriptadas
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage;
