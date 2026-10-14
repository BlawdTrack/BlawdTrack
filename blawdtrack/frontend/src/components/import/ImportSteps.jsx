import { Box, Typography } from '@mui/material';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { FONT, rem } from '../../theme';

/** Los tres pasos de la importación, en orden. */
const IMPORT_STEPS = ['Cargar archivos', 'Revisar datos', 'Listo'];

/**
 * Indicador de los tres pasos de la importación, en píldoras: el paso actual con el borde y el número en verde oscuro,
 * los anteriores con una marca y los siguientes en gris. El paso actual se anuncia a los lectores de pantalla con
 * `aria-current`.
 * @param {{ current: 1|2|3 }} props Número (desde 1) del paso en el que está el usuario.
 */
export default function ImportSteps({ current }) {
  return (
    <Box
      component="ol"
      aria-label="Pasos de la importación"
      sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, m: 0, p: 0, listStyle: 'none' }}
    >
      {IMPORT_STEPS.map((label, index) => {
        const number = index + 1;
        const isCurrent = number === current;
        const isDone = number < current;

        return (
          <Box
            key={label}
            component="li"
            aria-current={isCurrent ? 'step' : undefined}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              pl: 0.75,
              pr: 2,
              py: 0.75,
              border: '1px solid',
              borderColor: isCurrent ? 'primary.main' : 'neutral.border',
              borderRadius: rem(999),
              bgcolor: 'background.paper',
            }}
          >
            <Box
              aria-hidden="true"
              sx={{
                width: rem(28),
                height: rem(28),
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: FONT.sm,
                fontWeight: 700,
                bgcolor: isCurrent ? 'primary.main' : isDone ? 'success.main' : 'neutral.surface',
                color: isCurrent || isDone ? 'common.white' : 'text.secondary',
              }}
            >
              {isDone ? <CheckOutlinedIcon sx={{ fontSize: FONT.sm }} /> : number}
            </Box>
            <Typography
              component="span"
              sx={{ fontSize: FONT.md, fontWeight: isCurrent ? 700 : 600, color: isCurrent ? 'primary.main' : 'text.secondary' }}
            >
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
