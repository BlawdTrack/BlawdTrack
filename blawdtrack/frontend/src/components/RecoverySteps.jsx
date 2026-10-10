import { Box, Typography } from '@mui/material';
import { RADIUS, FONT, rem } from '../theme';

// Indicador de pasos del flujo de recuperación de contraseña (bloque
// `resetSteps` de assets/mockup-sprint1.html). El paso actual llega por prop
// para que la pantalla de nueva contraseña (T05) lo reutilice con current=3.
const STEPS = [
  { number: 1, label: 'Solicitar enlace' },
  { number: 2, label: 'Correo enviado' },
  { number: 3, label: 'Nueva contraseña' },
];

/**
 * @param {{ current: 1|2|3 }} props Paso actual: 1 solicitar enlace, 2 correo enviado, 3 nueva
 *   contraseña. Los anteriores se marcan como completados.
 */
export function RecoverySteps({ current }) {
  return (
    <Box
      component="ol"
      aria-label="Pasos para restablecer la contraseña"
      sx={{
        listStyle: 'none',
        m: 0,
        px: { xs: '16px', sm: '28px' },
        py: '1.1154rem',
        borderBottom: '1px solid', borderColor: 'neutral.border',
        display: 'flex',
        gap: '0.6154rem',
        flexWrap: 'nowrap',
      }}
    >
      {STEPS.map(({ number, label }) => {
        const isCurrent = number === current;
        const isDone = number < current;

        return (
          <Box
            component="li"
            key={number}
            aria-current={isCurrent ? 'step' : undefined}
            sx={{
              flex: { xs: isCurrent ? '1 1 auto' : '0 0 auto', sm: '1 1 180px' },
              display: 'flex',
              alignItems: 'center',
              gap: '0.6154rem',
              p: '0.6154rem 0.7308rem',
              borderRadius: RADIUS.sm,
              bgcolor: isCurrent ? 'neutral.surface' : 'transparent',
            }}
          >
            <Box
              component="span"
              sx={{
                width: rem(20),
                height: rem(20),
                flex: `0 0 ${rem(20)}`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: FONT.xs,
                fontWeight: 700,
                // Verde de marca en el paso actual, verde de éxito en los
                // ya completados y gris en los pendientes.
                bgcolor: isCurrent ? 'primary.main' : isDone ? 'success.main' : 'neutral.border',
                color: isCurrent || isDone ? 'common.white' : 'text.secondary',
              }}
            >
              {number}
            </Box>
            <Typography
              component="span"
              sx={{
                display: { xs: isCurrent ? 'inline' : 'none', sm: 'inline' },
                fontSize: FONT.xs,
                fontWeight: 600,
                lineHeight: 1.3,
                color: isCurrent ? 'primary.main' : 'text.secondary',
              }}
            >
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export default RecoverySteps;
