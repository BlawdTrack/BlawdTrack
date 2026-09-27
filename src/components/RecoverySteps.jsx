import { Box, Typography } from '@mui/material';

// Indicador de pasos del flujo de recuperación de contraseña (bloque
// `resetSteps` de assets/mockup-sprint1.html). El paso actual llega por prop
// para que la pantalla de nueva contraseña (T05) lo reutilice con current=3.
const STEPS = [
  { number: 1, label: 'Solicitar enlace' },
  { number: 2, label: 'Correo enviado' },
  { number: 3, label: 'Nueva contraseña' },
];

export function RecoverySteps({ current }) {
  return (
    <Box
      component="ol"
      aria-label="Pasos para restablecer la contraseña"
      sx={{
        listStyle: 'none',
        m: 0,
        px: '28px',
        py: '22px',
        borderBottom: '1px solid #E4DED7',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
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
              flex: '1 1 180px',
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
                color: isCurrent || isDone ? '#fff' : '#9E968D',
              }}
            >
              {number}
            </Box>
            <Typography
              component="span"
              sx={{
                fontSize: 12.5,
                fontWeight: 600,
                lineHeight: 1.3,
                color: isCurrent ? 'primary.main' : '#9E968D',
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
