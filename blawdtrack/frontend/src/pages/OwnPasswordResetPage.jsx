import { useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { useAuth } from '../hooks/useAuth';
import { useCountdown } from '../hooks/useCountdown';
import MailWaitIndicator from '../components/MailWaitIndicator';
import { requestOwnPasswordReset } from '../services/PasswordRecoveryService';
import { StatusMessage } from '../components/StatusMessage';
import PageContainer from '../components/PageContainer';
import { CARD_SX } from '../components/formStyles';
import HelpTip from '../components/HelpTip';
import PageHeaderBar from '../components/PageHeaderBar';

// Tiempo mínimo antes de pedir otro correo: el límite bajo de lo que puede tardar en llegar (2 a 5 minutos).
const RESEND_WAIT_SECONDS = 120;

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
  const resendWait = useCountdown(RESEND_WAIT_SECONDS);

  const handleSend = async () => {
    if (resendWait.running) return;
    setLoading(true);
    setError(null);
    try {
      await requestOwnPasswordReset();
      setSent(true);
      resendWait.start();
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

  const MAIL_HELP = 'El correo suele llegar en menos de 2 minutos, pero puede tardar hasta 5. Si no lo ves, revisa la carpeta de correo no deseado. El enlace vence en 15 minutos.';

  return (
    <>
      <PageHeaderBar
        title="Restablecer contraseña"
        description="Te enviaremos un enlace al correo de tu cuenta para elegir una contraseña nueva."
      />

      <PageContainer component="main" sx={{ alignItems: 'center', pt: { md: 6 } }}>
        <Paper elevation={0} sx={{ ...CARD_SX, width: '100%', maxWidth: 560, p: { xs: 3, sm: 5 }, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5, textAlign: 'center' }}>
          <Box
            aria-hidden
            sx={{ width: 72, height: 72, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: sent ? '#E9F3EC' : '#FFE8D9', color: sent ? '#2F7D4F' : 'secondary.main' }}
          >
            {sent ? <MarkEmailReadOutlinedIcon sx={{ fontSize: 36 }} /> : <LockResetOutlinedIcon sx={{ fontSize: 36 }} />}
          </Box>

          {sent ? (
            <Box role="status" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography component="h2" sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 24, color: 'primary.main' }}>
                Revisa tu correo
              </Typography>
              <Typography sx={{ fontSize: 16, color: '#6B6560', lineHeight: 1.55 }}>
                Te enviamos el enlace para restablecer tu contraseña a{' '}
                <Box component="strong" sx={{ color: '#1F2421', overflowWrap: 'anywhere' }}>{user?.email}</Box>.
              </Typography>
            </Box>
          ) : (
            <>
              <Typography component="h2" sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 24, color: 'primary.main' }}>
                Enviaremos el enlace a
              </Typography>
              <Box sx={{ width: '100%', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.25, borderRadius: '12px', bgcolor: '#F1ECE7' }}>
                <MailOutlinedIcon sx={{ color: 'primary.main' }} />
                <Typography sx={{ fontSize: 18, fontWeight: 600, wordBreak: 'break-all' }}>{user?.email}</Typography>
              </Box>
            </>
          )}

          {error && (
            <Box sx={{ width: '100%', textAlign: 'left' }}>
              <StatusMessage severity="error" message={error} />
            </Box>
          )}

          {resendWait.running && <MailWaitIndicator remaining={resendWait.remaining} total={RESEND_WAIT_SECONDS} />}

          <Button
            variant={sent ? 'outlined' : 'contained'}
            disableElevation
            fullWidth
            onClick={handleSend}
            disabled={loading || resendWait.running}
            sx={{ minHeight: 52, fontWeight: 700, fontSize: 16, borderRadius: '10px' }}
          >
            {loading ? 'Enviando…' : sent ? 'Enviar de nuevo' : 'Enviarme el enlace'}
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: 14, color: '#6B6560' }}>
              {sent ? '¿No te llega el correo?' : '¿Cuánto tarda en llegar?'}
            </Typography>
            <HelpTip label="¿Cuánto tarda en llegar el correo?">{MAIL_HELP}</HelpTip>
          </Box>
        </Paper>
      </PageContainer>
    </>
  );
}

export default OwnPasswordResetPage;
