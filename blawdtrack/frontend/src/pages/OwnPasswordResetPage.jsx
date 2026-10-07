import { useState } from 'react';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import { useAuth } from '../hooks/useAuth';
import { requestOwnPasswordReset } from '../services/PasswordRecoveryService';
import { StatusMessage } from '../components/StatusMessage';

const CONNECTION_ERROR_MESSAGE = 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
const DEFAULT_ERROR_MESSAGE = 'No se pudo enviar el correo de restablecimiento. Inténtalo de nuevo más tarde.';

/**
 * Pantalla "Restablecer contraseña" para cualquier rol con la sesión iniciada. No pide correo: envía el
 * enlace al de la propia cuenta (`POST /api/v1/auth/password-reset/request-own`), así que solo se puede
 * restablecer la contraseña propia. Si el correo no puede enviarse, muestra el motivo que responde el
 * backend en lugar de simular que salió.
 */
export function OwnPasswordResetPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    try {
      await requestOwnPasswordReset();
      setSent(true);
    } catch (requestError) {
      setSent(false);
      setError(
        requestError.response
          ? requestError.response.data?.message || DEFAULT_ERROR_MESSAGE
          : CONNECTION_ERROR_MESSAGE
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: '18px', border: '1px solid #E4DED7' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Restablecer contraseña
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>
            Te enviaremos un enlace para elegir una contraseña nueva al correo de tu cuenta. El enlace vence
            en 15 minutos.
          </Typography>

          <Typography sx={{ mb: 0.75, fontSize: '12.5px', fontWeight: 700, color: '#6B6560' }}>
            CORREO DE TU CUENTA
          </Typography>
          <Box
            sx={{
              mb: 3,
              p: 1.75,
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              borderRadius: '10px',
              bgcolor: '#F1ECE7',
            }}
          >
            <MailOutlinedIcon sx={{ color: 'primary.main' }} />
            <Typography sx={{ fontWeight: 600, wordBreak: 'break-all' }}>{user?.email}</Typography>
          </Box>

          {error && (
            <Box sx={{ mb: 2 }}>
              <StatusMessage severity="error" message={error} />
            </Box>
          )}
          {sent && (
            <Box sx={{ mb: 2 }}>
              <StatusMessage
                severity="success"
                message={`Revisa tu correo (${user?.email}): te enviamos el enlace para restablecer tu contraseña.`}
              />
            </Box>
          )}

          <Button
            variant="contained"
            onClick={handleSend}
            disabled={loading}
            sx={{ width: { xs: '100%', sm: 'auto' }, px: 3, minHeight: 48, fontWeight: 700 }}
          >
            {loading ? 'Enviando…' : sent ? 'Enviar de nuevo' : 'Enviarme el enlace'}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default OwnPasswordResetPage;
