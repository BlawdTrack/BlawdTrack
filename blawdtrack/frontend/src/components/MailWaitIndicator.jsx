import { Box, LinearProgress, Typography } from '@mui/material';

// Mensajes que van rotando mientras se espera: muestran que el sistema sigue trabajando.
const WAIT_MESSAGES = [
  'Enviando el correo…',
  'Tu correo va en camino…',
  'Esperando que llegue a tu bandeja…',
  'Puede tardar un poco, el sistema sigue trabajando…',
];
const SECONDS_PER_MESSAGE = 6;

/** Espera mínima antes de pedir otro correo: el límite bajo de lo que puede tardar en llegar (2 a 5 minutos). */
export const MAIL_RESEND_WAIT_SECONDS = 120;

const formatClock = (totalSeconds) => (
  `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`
);

/**
 * Indicador de espera tras enviar un correo: una barra que avanza, un mensaje que cambia cada pocos segundos
 * y el tiempo que falta para poder pedir otro. Así se ve que el sistema está haciendo algo y no se colgó.
 * @param {{ remaining: number, total: number }} props Segundos que faltan y duración total de la espera.
 */
export default function MailWaitIndicator({ remaining, total }) {
  const elapsed = total - remaining;
  const message = WAIT_MESSAGES[Math.floor(elapsed / SECONDS_PER_MESSAGE) % WAIT_MESSAGES.length];

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <LinearProgress
        variant="determinate"
        value={(elapsed / total) * 100}
        aria-label="Tiempo de espera para pedir otro correo"
        sx={{ height: 8, borderRadius: 4, bgcolor: 'neutral.surface' }}
      />
      <Typography aria-live="off" sx={{ fontSize: 14, color: 'text.secondary' }}>{message}</Typography>
      <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
        Podrás pedir otro en <strong>{formatClock(remaining)}</strong>
      </Typography>
    </Box>
  );
}
