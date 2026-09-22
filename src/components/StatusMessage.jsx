import { Box, Typography } from '@mui/material';

// Colores exactos del mockup (bloques "Estados de error" de la pantalla A
// y "Validación de formato" de la B1). Distinto del componente Toast:
// este es para mensajes fijos dentro del formulario, no notificaciones
// flotantes.
const VARIANTS = {
  error: { bg: '#FCEDEA', border: '#E8B4AC', dot: '#C0392B', text: '#7A2318' },
  warning: { bg: '#FCF3E3', border: '#EBC98A', dot: '#C9860F', text: '#7A5A12' },
  success: { bg: '#E5F1E8', border: '#BFE0CC', dot: '#2F7D4F', text: '#1E5236' },
};

export function StatusMessage({ severity = 'error', message }) {
  const variant = VARIANTS[severity] || VARIANTS.error;

  return (
    <Box
      sx={{
        bgcolor: variant.bg,
        border: `1px solid ${variant.border}`,
        borderRadius: '10px',
        p: '14px 16px',
        display: 'flex',
        gap: 1.25,
      }}
    >
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: variant.dot, mt: '5px', flexShrink: 0 }} />
      <Typography sx={{ fontSize: 14, color: variant.text, lineHeight: 1.4 }}>{message}</Typography>
    </Box>
  );
}

export default StatusMessage;
