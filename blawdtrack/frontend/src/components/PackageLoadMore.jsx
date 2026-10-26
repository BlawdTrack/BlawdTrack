import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { FONT, TOUCH_TARGET } from '../theme';

/**
 * Pie de la lista de paquetes (HU-014): cuántos se muestran de cuántos hay y, si quedan más, el botón para traer
 * los siguientes. No dibuja nada si la lista ya está completa.
 * @param {{ shownCount: number, totalCount: number, canLoadMore: boolean, isLoadingMore: boolean,
 *   onLoadMore: Function }} props
 */
export function PackageLoadMore({ shownCount, totalCount, canLoadMore, isLoadingMore, onLoadMore }) {
  if (!canLoadMore && !isLoadingMore) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
      <Typography role="status" aria-live="polite" data-testid="package-load-more-count" sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>
        Mostrando {shownCount} de {totalCount} paquetes
      </Typography>
      <Button
        type="button"
        variant="outlined"
        onClick={onLoadMore}
        data-testid="package-load-more"
        disabled={isLoadingMore}
        startIcon={isLoadingMore ? <CircularProgress size={16} /> : null}
        sx={{ minHeight: TOUCH_TARGET, px: 3 }}
      >
        {isLoadingMore ? 'Cargando…' : 'Cargar más paquetes'}
      </Button>
    </Box>
  );
}

export default PackageLoadMore;
