import { Box, Paper } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { getPackageStatusMeta } from '../config/packageStatus';
import { CARD_SX } from './formStyles';
import { FONT, rem } from '../theme';

// Los cinco pasos del camino de un paquete, con las claves del enum del backend.
const STEPS = ['PENDING', 'ASSIGNED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED'];
const LAST = STEPS.length - 1;
const NOT_DELIVERED = 'NOT_DELIVERED';
const MARKER = 28;

/**
 * Posición actual en el camino y etiqueta del último paso. Un paquete "No entregado" llegó hasta "En tránsito" y su
 * último paso pasa a decir "No entregado"; un estado fuera del catálogo no tiene posición.
 */
function progressOf(status) {
  if (status === NOT_DELIVERED) return { current: LAST, lastLabel: getPackageStatusMeta(NOT_DELIVERED).label };
  const current = STEPS.indexOf(status);
  return { current: current < 0 ? null : current, lastLabel: getPackageStatusMeta('DELIVERED').label };
}

const stepColors = (index, current) => {
  if (index < current) return { text: 'primary.main', fill: 'success.main', border: 'success.main', mark: 'success.contrastText' };
  if (index === current) return { text: 'secondary.dark', fill: 'secondary.light', border: 'secondary.main', mark: 'secondary.dark' };
  return { text: 'text.secondary', fill: 'background.paper', border: 'neutral.borderStrong', mark: 'text.secondary' };
};

/**
 * Avance del paquete: Pendiente → Asignado → Enviado → En tránsito → Entregado, con los pasos ya cumplidos en verde, el
 * actual resaltado en naranja y la línea que los une. No muestra nada si el estado no es uno del catálogo.
 * @param {{ status: string }} props Estado del paquete (clave del backend).
 */
export default function PackageProgress({ status }) {
  const { current, lastLabel } = progressOf(status);
  if (current === null) return null;

  return (
    <Paper
      elevation={0}
      component="section"
      aria-label="Avance del paquete"
      data-testid="package-progress"
      sx={{ ...CARD_SX, px: { xs: 1.5, md: 3 }, pt: 2.5, pb: 1.5 }}
    >
      <Box component="ol" sx={{ display: 'flex', listStyle: 'none', m: 0, p: 0 }}>
        {STEPS.map((step, index) => {
          const label = index === LAST ? lastLabel : getPackageStatusMeta(step).label;
          const colors = stepColors(index, current);

          return (
            <Box
              component="li"
              key={step}
              aria-current={index === current ? 'step' : undefined}
              data-testid={`package-progress-${step}`}
              sx={{ flex: 1, position: 'relative', textAlign: 'center', fontSize: FONT.sm, fontWeight: 600, color: colors.text }}
            >
              {index > 0 && (
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    top: rem(MARKER / 2 - 1.5),
                    left: '-50%',
                    width: '100%',
                    height: 3,
                    bgcolor: index <= current ? 'success.main' : 'neutral.borderStrong',
                  }}
                />
              )}
              <Box
                aria-hidden
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  boxSizing: 'border-box',
                  display: 'grid',
                  placeItems: 'center',
                  width: rem(MARKER),
                  height: rem(MARKER),
                  mx: 'auto',
                  mb: 0.75,
                  borderRadius: '50%',
                  border: '3px solid',
                  borderColor: colors.border,
                  bgcolor: colors.fill,
                  color: colors.mark,
                  fontSize: FONT.xs,
                  lineHeight: 1,
                }}
              >
                {index < current ? <CheckIcon sx={{ fontSize: rem(14) }} /> : index + 1}
              </Box>
              {label}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
