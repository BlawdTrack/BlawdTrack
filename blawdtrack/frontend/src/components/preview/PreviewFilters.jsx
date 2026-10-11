import { Box, Chip } from '@mui/material';
import { PREVIEW_FILTERS } from '../../utils/importPreview';
import { FONT, RADIUS } from '../../theme';

/**
 * Filtros de la lista de registros: Todos, Válidos, Con errores y Duplicados, cada uno con su cantidad. Son botones
 * de activación (`aria-pressed`) y el activo se distingue por el relleno y por el estado, no solo por el color.
 * @param {{ counts: { read: number, valid: number, invalid: number, duplicate: number }, active: string,
 *   onChange: (filterId: string) => void }} props
 */
export default function PreviewFilters({ counts, active, onChange }) {
  const quantityOf = { all: counts.read, valid: counts.valid, invalid: counts.invalid, duplicate: counts.duplicate };

  return (
    <Box role="group" aria-label="Filtrar registros" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {PREVIEW_FILTERS.map(({ id, label }) => {
        const isActive = id === active;
        return (
          <Chip
            key={id}
            component="button"
            type="button"
            aria-pressed={isActive}
            label={`${label} (${quantityOf[id]})`}
            onClick={() => onChange(id)}
            sx={{
              fontSize: FONT.sm,
              borderRadius: RADIUS.lg,
              border: '1px solid',
              borderColor: isActive ? 'primary.main' : 'neutral.borderStrong',
              bgcolor: isActive ? 'primary.main' : 'background.paper',
              color: isActive ? 'common.white' : 'text.primary',
              cursor: 'pointer',
              '&:hover': { bgcolor: isActive ? 'primary.dark' : 'neutral.surface' },
            }}
          />
        );
      })}
    </Box>
  );
}
