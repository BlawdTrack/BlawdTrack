import { Box, Typography } from '@mui/material';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { FONT, RADIUS, rem } from '../../theme';

/** Los tres pasos de la importación, en orden. */
const IMPORT_STEPS = ['Cargar archivo', 'Previsualizar y validar', 'Confirmar registro'];

/**
 * Indicador de los tres pasos de la importación: el paso actual resaltado, los anteriores con una marca y los
 * siguientes en gris. El paso actual se anuncia a los lectores de pantalla con `aria-current`.
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
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: RADIUS.lg,
              bgcolor: isCurrent ? 'neutral.surface' : 'transparent',
            }}
          >
            <Box
              aria-hidden="true"
              sx={{
                width: rem(24),
                height: rem(24),
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: FONT.xs,
                fontWeight: 700,
                bgcolor: isCurrent ? 'primary.main' : isDone ? 'success.main' : 'neutral.border',
                color: isCurrent || isDone ? 'common.white' : 'neutral.main',
              }}
            >
              {isDone ? <CheckOutlinedIcon sx={{ fontSize: FONT.sm }} /> : number}
            </Box>
            <Typography
              component="span"
              sx={{ fontSize: FONT.sm, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'primary.main' : 'text.secondary' }}
            >
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
