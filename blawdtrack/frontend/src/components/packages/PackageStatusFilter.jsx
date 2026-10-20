import { Box, Typography } from '@mui/material';
import { ALL_STATUSES, STATUS_FILTER_OPTIONS } from '../../config/packageSearch';
import { FONT, RADIUS, TOUCH_TARGET } from '../../theme';

const countOf = (counts, value) => {
  if (!counts) return null;
  if (value === ALL_STATUSES) return Object.values(counts).reduce((sum, count) => sum + count, 0);
  return counts[value] ?? 0;
};

/**
 * Pestañas del filtro por estado de "Consultar paquetes": Todos y un botón por estado, cada uno con su cantidad (si
 * ya se conocen). Son botones de activación (`aria-pressed`) y el activo se distingue por el relleno, no solo por el
 * color. Elegir una pestaña filtra al instante.
 * @param {{ counts: Record<string, number>|null, active: string, onChange: (status: string) => void }} props
 *   `counts` es la cantidad por estado del backend; sin ella las pestañas no muestran número.
 */
export default function PackageStatusFilter({ counts, active, onChange }) {
  return (
    <Box role="group" aria-label="Filtrar por estado" sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
      {STATUS_FILTER_OPTIONS.map(({ value, label }) => {
        const isActive = value === active;
        const count = countOf(counts, value);
        return (
          <Box
            key={value}
            component="button"
            type="button"
            aria-pressed={isActive}
            data-testid={`package-status-${value}`}
            onClick={() => onChange(value)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              minHeight: TOUCH_TARGET,
              px: 1.75,
              fontFamily: 'inherit',
              fontSize: FONT.md,
              fontWeight: 600,
              borderRadius: RADIUS.lg,
              border: '1.5px solid',
              borderColor: isActive ? 'primary.main' : 'neutral.borderStrong',
              bgcolor: isActive ? 'primary.main' : 'background.paper',
              color: isActive ? 'common.white' : 'text.secondary',
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main' },
              '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: 2 },
            }}
          >
            {label}
            {count !== null && (
              <Typography
                component="span"
                data-testid={`package-status-count-${value}`}
                sx={{ fontSize: FONT.sm, fontWeight: 700, opacity: 0.8 }}
              >
                {count}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
