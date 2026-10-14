import { Box, Link, Typography } from '@mui/material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { LINK_BUTTON_SX } from './formStyles';
import { FOCUS_RING_SX, REDUCED_MOTION_SX } from './authStyles';
import { FONT, TOUCH_TARGET } from '../theme';

const TOTAL_STEPS = 3;

/**
 * Parte de arriba de las pantallas de recuperación de contraseña: el enlace "Volver a iniciar sesión" y la barra de
 * progreso de 3 segmentos con "Paso N de 3" (el actual en naranja, los completados en verde y los pendientes en gris).
 * @param {{ current: 1|2|3, onBackToLogin?: Function }} props Paso actual: 1 solicitar enlace, 2 correo enviado, 3
 *   nueva contraseña. Los anteriores se marcan como completados.
 */
export default function RecoveryProgress({ current, onBackToLogin }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Link
        component="button"
        type="button"
        onClick={() => onBackToLogin?.()}
        underline="hover"
        sx={{
          ...LINK_BUTTON_SX,
          ...FOCUS_RING_SX,
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          minHeight: TOUCH_TARGET,
          color: 'text.secondary',
          fontWeight: 600,
          fontSize: FONT.lg,
        }}
      >
        <ArrowBackOutlinedIcon aria-hidden sx={{ fontSize: FONT.xl }} />
        Volver a iniciar sesión
      </Link>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          component="ol"
          aria-label="Pasos para restablecer la contraseña"
          sx={{ listStyle: 'none', m: 0, p: 0, flex: 1, display: 'flex', gap: 0.75 }}
        >
          {Array.from({ length: TOTAL_STEPS }, (_, index) => {
            const number = index + 1;
            const isCurrent = number === current;
            const isDone = number < current;
            return (
              <Box
                component="li"
                key={number}
                aria-current={isCurrent ? 'step' : undefined}
                sx={{
                  position: 'relative',
                  flex: 1,
                  height: 5,
                  borderRadius: 3,
                  // Naranja en el paso actual, verde en los completados y gris en los pendientes.
                  bgcolor: isCurrent ? 'secondary.main' : isDone ? 'success.main' : 'neutral.border',
                  transition: 'background-color .2s ease',
                  ...REDUCED_MOTION_SX,
                }}
              >
                <Box component="span" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                  Paso {number}
                  {isDone ? ' completado' : isCurrent ? ' actual' : ' pendiente'}
                </Box>
              </Box>
            );
          })}
        </Box>
        <Typography sx={{ fontSize: FONT.lg, fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>
          Paso {current} de {TOTAL_STEPS}
        </Typography>
      </Box>
    </Box>
  );
}
