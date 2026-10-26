import { Box, Typography } from '@mui/material';
import { PREVIEW_FILTERS, PREVIEW_STATUS } from '../../utils/importPreview';
import { FONT, RADIUS, TOUCH_TARGET } from '../../theme';

// Color del número de cada pestaña cuando no es la activa; "Todos" va en el color base.
const COUNT_COLOR = {
  all: 'primary.main',
  [PREVIEW_STATUS.VALID]: 'success.main',
  [PREVIEW_STATUS.INVALID]: 'error.main',
  [PREVIEW_STATUS.DUPLICATE]: 'warning.text',
};

// Selector de cada total, el mismo que usan las pruebas de extremo a extremo (`import-count-*`).
const COUNT_TEST_ID = { all: 'read', [PREVIEW_STATUS.VALID]: 'valid', [PREVIEW_STATUS.INVALID]: 'invalid', [PREVIEW_STATUS.DUPLICATE]: 'duplicate' };

/**
 * Pestañas de la lista de registros: Todos, Válidos, Con errores y Duplicados, cada una con su cantidad. Son botones de
 * activación (`aria-pressed`) y la activa se distingue por el relleno y por el estado, no solo por el color. También son
 * los totales de la previsualización: registros leídos, válidos, con errores y duplicados.
 * @param {{ counts: { read: number, valid: number, invalid: number, duplicate: number }, active: string,
 *   onChange: (filterId: string) => void }} props
 */
export default function PreviewFilters({ counts, active, onChange }) {
  const quantityOf = { all: counts.read, valid: counts.valid, invalid: counts.invalid, duplicate: counts.duplicate };

  return (
    <Box role="group" aria-label="Filtrar registros" sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
      {PREVIEW_FILTERS.map(({ id, label }) => {
        const isActive = id === active;
        return (
          <Box
            key={id}
            component="button"
            type="button"
            aria-pressed={isActive}
            data-testid={`import-filter-${id}`}
            aria-label={`${label} (${quantityOf[id]})`}
            onClick={() => onChange(id)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              minHeight: TOUCH_TARGET,
              px: 1.75,
              fontFamily: 'inherit',
              fontSize: FONT.md,
              fontWeight: 600,
              borderRadius: RADIUS.sm,
              border: '1.5px solid',
              borderColor: isActive ? 'primary.main' : 'neutral.borderStrong',
              bgcolor: isActive ? 'primary.main' : 'background.paper',
              color: isActive ? 'common.white' : 'text.secondary',
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main' },
              '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: 2 },
            }}
          >
            <Typography
              component="b"
              data-testid={`import-count-${COUNT_TEST_ID[id]}`}
              sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: FONT.lg, color: isActive ? 'common.white' : COUNT_COLOR[id] }}
            >
              {quantityOf[id]}
            </Typography>
            {label}
          </Box>
        );
      })}
    </Box>
  );
}
