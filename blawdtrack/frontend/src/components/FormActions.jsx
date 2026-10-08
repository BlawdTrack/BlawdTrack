import { Box, Button, CircularProgress } from '@mui/material';
import { RADIUS } from '../theme';

/**
 * Botones al pie de un formulario de creación: el principal (con un punto naranja, como el resto de la
 * aplicación) y "Descartar".
 * @param {{ submitLabel: string, submittingLabel: string, isSubmitting: boolean, onDiscard: Function }} props
 */
export default function FormActions({ submitLabel, submittingLabel, isSubmitting, onDiscard }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', '& button': { width: { xs: '100%', sm: 'auto' } } }}>
      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        sx={{ fontWeight: 600, px: 4, minHeight: 52, fontSize: 16, borderRadius: RADIUS.sm, gap: 1.2, boxShadow: 'none' }}
      >
        {isSubmitting ? (
          <>
            <CircularProgress size={18} color="inherit" />
            {submittingLabel}
          </>
        ) : (
          <>
            {submitLabel}
            <Box component="span" sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FF6C0E' }} />
          </>
        )}
      </Button>
      <Button
        type="button"
        variant="outlined"
        onClick={onDiscard}
        disabled={isSubmitting}
        sx={{ color: 'primary.main', border: '1.5px solid', borderColor: 'neutral.borderStrong', fontWeight: 600, px: 3, minHeight: 52, fontSize: 16, borderRadius: RADIUS.sm }}
      >
        Descartar
      </Button>
    </Box>
  );
}
