import { Snackbar, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Notificación flotante, tal como aparece en el mockup (pantallas D y F:
// "Notificaciones toast"). Se apoya en el Snackbar de MUI solo para el
// posicionamiento, auto-cierre y el portal — el contenido visual es
// completamente propio, para que coincida con el diseño exacto del
// mockup en vez del Alert por defecto de MUI.
const SEVERITY_STYLES = {
  success: '#2F7D4F',
  error: '#C0392B',
  warning: '#C9860F',
};

/** Segundos que dura un aviso antes de cerrarse solo: tiempo para leer una o dos frases sin estorbar. */
export const DEFAULT_TOAST_DURATION_MS = 6000;

/**
 * Aviso flotante en la esquina inferior derecha. Se cierra solo (6 segundos por defecto; se pausa mientras
 * se pasa el cursor por encima) y también con la X. Un clic en otra parte de la pantalla no lo cierra, para
 * que no desaparezca antes de que se alcance a leer.
 * @param {{ open: boolean, message: string, severity?: 'success'|'error'|'warning',
 *   onClose: Function, autoHideDuration?: number }} props
 */
export function Toast({ open, message, severity = 'success', onClose, autoHideDuration = DEFAULT_TOAST_DURATION_MS }) {
  const accentColor = SEVERITY_STYLES[severity] || SEVERITY_STYLES.success;

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    onClose?.(event, reason);
  };

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      autoHideDuration={autoHideDuration}
      // Esquina inferior derecha en escritorio; en móvil, sobre la barra de pestañas inferior.
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{ bottom: { xs: 100, sm: 32 }, right: { sm: 32 } }}
    >
      <Box
        role="status"
        aria-live="polite"
        sx={{
          bgcolor: '#ffffff',
          borderRadius: '12px',
          borderLeft: `6px solid ${accentColor}`,
          boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
          pl: 2.5,
          pr: 1,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.75,
          minWidth: { xs: 'auto', sm: 360 },
          maxWidth: { xs: '100%', sm: 520 },
        }}
      >
        <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: accentColor, flexShrink: 0 }} />
        <Typography sx={{ flex: 1, fontSize: 16, lineHeight: 1.45, color: '#1F2421' }}>{message}</Typography>
        <IconButton
          onClick={(event) => handleClose(event, 'closeButton')}
          aria-label="Cerrar aviso"
          size="small"
          sx={{ alignSelf: 'flex-start', width: 36, height: 36, color: '#6B6560', '&:hover': { bgcolor: '#F1ECE7' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Snackbar>
  );
}

export default Toast;
