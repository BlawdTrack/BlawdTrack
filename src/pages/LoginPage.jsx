import { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Link,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { StatusMessage } from '../components/StatusMessage';
import blawdtrackLogo from '../assets/Logo.png';

// Candado de dos tonos (blanco + punto naranja), reconstruido a partir
// del mockup — ahí también está armado con formas simples en vez de un
// ícono importado.
function LockIcon({ size = 26 }) {
  const scale = size / 26;
  return (
    <Box sx={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: 2 * scale,
          width: 15 * scale,
          height: 11 * scale,
          border: `${2.5 * scale}px solid #fff`,
          borderBottom: 'none',
          borderRadius: '8px 8px 0 0',
          transform: 'translateX(-50%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: 10 * scale,
          width: 19 * scale,
          height: 13 * scale,
          bgcolor: '#fff',
          borderRadius: '2px',
          transform: 'translateX(-50%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: 15 * scale,
          width: 3 * scale,
          height: 3 * scale,
          bgcolor: 'secondary.main',
          borderRadius: '50%',
          transform: 'translateX(-50%)',
        }}
      />
    </Box>
  );
}

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
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #E4DED7' }}>
          <Box sx={{ height: 4, bgcolor: 'secondary.main' }} />

          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              px: { xs: 3, sm: 6 },
              pt: 4.5,
              pb: 5,
              textAlign: 'center',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', mb: '28px' }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  bgcolor: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                }}
              >
                <img
                  src={blawdtrackLogo}
                  alt="BlawdTrack"
                  style={{ width: 24, height: 29, objectFit: 'contain' }}
                />
              </Box>
              <Typography variant="h6" component="span">
                BlawdTrack
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <LockIcon size={26} />
              <Typography variant="h4" component="h1">
                Iniciar sesión
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', mt: 1 }}>
              Ingresa con tu correo y contraseña para acceder al panel de BlawdTrack.
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              p: { xs: 3, sm: 5 },
              bgcolor: '#F1ECE7',
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
            }}
          >
            {error && <StatusMessage severity={error.severity} message={error.message} />}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Typography
                sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.4px' }}
              >
                Correo electrónico
              </Typography>
              <TextField
                fullWidth
                required
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
              <Typography
                sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.4px' }}
              >
                Contraseña
              </Typography>
              <TextField
                fullWidth
                required
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password}
              />
            </Box>

            <Link
              component="button"
              type="button"
              onClick={() => onForgotPassword?.()}
              underline="hover"
              sx={{ alignSelf: 'flex-end', color: 'primary.main', fontWeight: 600, fontSize: 13 }}
            >
              ¿Olvidaste tu contraseña?
            </Link>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ fontWeight: 'bold', fontSize: 15, display: 'flex', gap: '10px' }}
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
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;
