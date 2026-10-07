import { Box, Typography } from '@mui/material';

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
        py: '18px',
        borderBottom: '1px solid #E4DED7',
        display: 'flex',
        gap: '10px',
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
              gap: '10px',
              p: '10px 12px',
              borderRadius: '10px',
              bgcolor: isCurrent ? '#F1ECE7' : 'transparent',
            }}
          >
            <Box
              component="span"
              sx={{
                width: 24,
                height: 24,
                flex: '0 0 24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                // Verde de marca en el paso actual, verde de éxito en los
                // ya completados y gris en los pendientes.
                bgcolor: isCurrent ? 'primary.main' : isDone ? '#2F7D4F' : '#E4DED7',
                color: isCurrent || isDone ? '#fff' : '#6B6560',
              }}
            >
              {number}
            </Box>
            <Typography
              component="span"
              sx={{
                display: { xs: isCurrent ? 'inline' : 'none', sm: 'inline' },
                fontSize: 12,
                fontWeight: 600,
                lineHeight: 1.3,
                color: isCurrent ? 'primary.main' : '#6B6560',
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
