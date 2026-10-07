import { Snackbar, Box, Typography } from '@mui/material';

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

/**
 * @param {{ open: boolean, message: string, severity?: 'success'|'error'|'warning',
 *   onClose: Function, autoHideDuration?: number }} props Notificación flotante que se cierra sola
 *   a los 4 segundos por defecto.
 */
export function Toast({ open, message, severity = 'success', onClose, autoHideDuration = 4000 }) {
  const accentColor = SEVERITY_STYLES[severity] || SEVERITY_STYLES.success;

  return (
    <Snackbar
      open={open}
      onClose={onClose}
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
          px: 2.5,
          py: 2.25,
          display: 'flex',
          alignItems: 'center',
          gap: 1.75,
          minWidth: { xs: 'auto', sm: 360 },
          maxWidth: { xs: '100%', sm: 520 },
        }}
      >
        <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: accentColor, flexShrink: 0 }} />
        <Typography sx={{ fontSize: 16, lineHeight: 1.45, color: '#1F2421' }}>{message}</Typography>
      </Box>
    </Snackbar>
  );
}

export default Toast;
