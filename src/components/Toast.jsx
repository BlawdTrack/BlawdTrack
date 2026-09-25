import React from 'react';
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

export function Toast({ open, message, severity = 'success', onClose, autoHideDuration = 4000 }) {
  const accentColor = SEVERITY_STYLES[severity] || SEVERITY_STYLES.success;

  return (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={autoHideDuration}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Box
        role="status"
        aria-live="polite"
        sx={{
          bgcolor: '#ffffff',
          borderRadius: '10px',
          borderLeft: `4px solid ${accentColor}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          px: 2,
          py: 1.75,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          minWidth: { xs: 'auto', sm: 280 },
          maxWidth: { xs: '100%', sm: 380 },
        }}
      >
        <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: accentColor, flexShrink: 0 }} />
        <Typography sx={{ fontSize: 13.5, color: '#1F2421' }}>{message}</Typography>
      </Box>
    </Snackbar>
  );
}

export default Toast;
