import { Box, Button, CircularProgress } from '@mui/material';
import { CARD_PATTERN_SX, RADIUS, FONT, TOUCH_TARGET } from '../theme';

/**
 * Barra inferior de los formularios de edición de cuentas: "Guardar cambios" (con indicador mientras guarda) y
 * "Descartar". Queda siempre a la vista bajo el contenido que se desplaza.
 * @param {{ submitting: boolean, onDiscard: Function }} props
 */
export default function EditFormActions({ submitting, onDiscard }) {
  return (
    <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'neutral.border', ...CARD_PATTERN_SX, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
      <Button
        type="submit"
        variant="contained"
        data-testid="edit-save"
        disabled={submitting}
        sx={{ fontWeight: 600, px: 4, minHeight: TOUCH_TARGET, fontSize: FONT.md, borderRadius: RADIUS.sm }}
      >
        {submitting ? <CircularProgress size={22} sx={{ color: 'inherit' }} /> : 'Guardar cambios'}
      </Button>
      <Button
        type="button"
        variant="outlined"
        onClick={onDiscard}
        data-testid="edit-discard"
        disabled={submitting}
        sx={{ color: 'primary.main', border: '1.5px solid', borderColor: 'neutral.borderStrong', fontWeight: 600, px: 3, minHeight: TOUCH_TARGET, fontSize: FONT.md, borderRadius: RADIUS.sm }}
      >
        Descartar
      </Button>
    </Box>
  );
}
