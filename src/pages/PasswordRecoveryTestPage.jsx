import { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { requestPasswordReset } from '../services/PasswordRecoveryService';
import { Toast } from '../components/Toast';

// Pantalla de PRUEBA para T06 (HU-002): solo valida la integración con el
// endpoint de solicitud de recuperación y el patrón de notificación tipo
// toast pedido en la tarea. La pantalla final (con el diseño completo de
// las vistas B1/B2 del mockup) la está construyendo otro compañero;
// cuando esté lista, se reemplaza este formulario por la suya y se
// reutiliza tal cual PasswordRecoveryService + Toast.
//
// Nota: el endpoint responde siempre con el mismo mensaje de éxito, exista
// o no el correo (así lo diseñó el backend a propósito, para no revelar
// qué correos están registrados) — por eso aquí solo hay un toast de
// éxito posible; el toast de error queda para fallas reales de red o
// validación (correo con formato inválido, servidor caído, etc.).
export function PasswordRecoveryTestPage({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const closeToast = () => setToast((prev) => ({ ...prev, open: false }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await requestPasswordReset(email);
      setToast({ open: true, message: response.message, severity: 'success' });
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setToast({
        open: true,
        message: backendMessage || 'No se pudo procesar la solicitud. Intenta de nuevo.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ height: 4, bgcolor: 'secondary.main' }} />
          <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 3, textAlign: 'center' }}>
            <Typography variant="overline" sx={{ opacity: 0.6, letterSpacing: 1.2 }}>
              Pantalla de prueba · T06
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              Recuperar contraseña
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
              Te enviaremos un enlace para restablecer tu contraseña.
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ p: 4, bgcolor: '#F1ECE7', display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            <TextField
              fullWidth
              required
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              helperText="Ingresa cualquier correo — la respuesta es la misma exista o no la cuenta (por seguridad, así lo definió el backend)."
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ fontWeight: 'bold' }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'inherit' }} /> : 'Enviar enlace'}
            </Button>

            <Button variant="text" onClick={() => onBackToLogin?.()} sx={{ color: 'primary.main' }}>
              Volver a iniciar sesión
            </Button>
          </Box>
        </Paper>
      </Container>

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={closeToast} />
    </Box>
  );
}

export default PasswordRecoveryTestPage;
