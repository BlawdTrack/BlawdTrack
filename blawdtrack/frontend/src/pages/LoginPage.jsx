import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
  useTheme,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

// Distintivo de paquetería/mensajería: mismo formato de ícono plano
// (un solo path, color por prop) usado en el resto de la pantalla.
function PackageCustomIcon({ color, size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2 2 7v10l10 5 10-5V7L12 2zm0 2.18L18.82 7 12 9.82 5.18 7 12 4.18zM4 8.66l7 3.5v7.82l-7-3.5V8.66zm9 11.32v-7.82l7-3.5v7.82l-7 3.5z" />
    </svg>
  );
}

// onLoginSuccess recibe la respuesta cruda del backend (o del mock), con la
// misma forma que LoginResponse. Guardar el token de forma segura es tarea
// de T16; aquí solo se entrega la respuesta a quien la necesite.
export function LoginPage({ onLoginSuccess, onSubmitAttempt, onForgotPassword }) {
  const theme = useTheme();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, loading, error, resetError } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previousData) => ({ ...previousData, [name]: value }));
    if (error) resetError();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    onSubmitAttempt?.();
    try {
      const response = await login(formData.email, formData.password);
      onLoginSuccess?.(response);
    } catch {
      // El mensaje de error ya queda reflejado por el hook useAuth.
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              p: 3,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PackageCustomIcon color={theme.palette.secondary.main} size={32} />
              <Typography variant="h5" component="h1" fontWeight="bold">
                BlawdTrack
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
              Inicia sesión en tu plataforma de paquetería
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              fullWidth
              required
              label="Correo electrónico"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />

            <TextField
              fullWidth
              required
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 1, py: 1.5, fontWeight: 'bold', fontSize: '1rem' }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'inherit' }} /> : 'Iniciar sesión'}
            </Button>

            <Link
              component="button"
              type="button"
              onClick={() => onForgotPassword?.()}
              underline="hover"
              sx={{
                color: 'secondary.main',
                fontWeight: 600,
                fontSize: '0.875rem',
                alignSelf: 'center',
              }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;
