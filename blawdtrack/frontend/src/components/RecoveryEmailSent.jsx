import { Box, Button, CircularProgress, Link, Typography } from '@mui/material';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import AuthStateHeader from './AuthStateHeader';
import { AUTH_BUTTON_SX, FOCUS_RING_SX } from './authStyles';
import { LINK_BUTTON_SX } from './formStyles';
import { formatClock } from '../utils/formatClock';
import { FONT } from '../theme';

/**
 * Confirmación "Revisa tu correo" (HU-002), con el reenvío del enlace y el camino para usar otro correo. No tiene
 * estado propio: todo viene de `usePasswordRecoveryRequest`.
 * @param {{ request: ReturnType<import('../hooks/usePasswordRecoveryRequest').usePasswordRecoveryRequest> }} props
 */
export function RecoveryEmailSent({ request }) {
  const { sentEmail, loading, resendWait, onResend, onUseAnotherEmail } = request;

  return (
    <Box role="status" data-testid="recovery-email-sent" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
        onClick={onResend}
        disabled={loading || resendWait.running}
        data-testid="recovery-resend"
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
        onClick={onUseAnotherEmail}
        underline="always"
        data-testid="recovery-use-another"
        sx={{ ...LINK_BUTTON_SX, ...FOCUS_RING_SX, alignSelf: 'flex-start', minHeight: 44, fontSize: FONT.lg, fontWeight: 700, color: 'primary.main' }}
      >
        Usar otro correo
      </Link>
    </Box>
  );
}

export default RecoveryEmailSent;
