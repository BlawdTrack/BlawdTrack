import { Box, Typography } from '@mui/material';
import { RADIUS, FONT, rem } from '../theme';

// Colores exactos del mockup (bloques "Estados de error" de la pantalla A
// y "Validación de formato" de la B1). Distinto del componente Toast:
// este es para mensajes fijos dentro del formulario, no notificaciones
// flotantes.
const VARIANTS = {
  error: { bg: 'error.light', border: 'error.border', dot: 'error.main', text: 'error.text' },
  warning: { bg: 'warning.light', border: 'warning.border', dot: 'warning.main', text: 'warning.text' },
  success: { bg: 'success.light', border: 'success.border', dot: 'success.main', text: 'success.text' },
};

/**
 * @param {{ severity?: 'error'|'warning'|'success', message: string, title?: string }} props Aviso fijo
 *   dentro de un formulario. Los errores y avisos se anuncian de forma asertiva (`role="alert"`); el éxito,
 *   de forma cortés (`role="status"`). Con `title`, el aviso lleva una primera línea en negrita sobre el mensaje.
 */
export function StatusMessage({ severity = 'error', message, title }) {
  const variant = VARIANTS[severity] || VARIANTS.error;

  // Errors and warnings interrupt (assertive); success is announced politely.
  const isUrgent = severity !== 'success';

  return (
    <Box
      role={isUrgent ? 'alert' : 'status'}
      aria-live={isUrgent ? 'assertive' : 'polite'}
      sx={{
        bgcolor: variant.bg,
        border: '1px solid',
        borderColor: variant.border,
        borderRadius: RADIUS.sm,
        p: '0.8462rem 1rem',
        display: 'flex',
        gap: 1.25,
      }}
    >
      <Box sx={{ width: rem(8), height: rem(8), borderRadius: '50%', bgcolor: variant.dot, mt: '0.3077rem', flexShrink: 0 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
        {title && <Typography sx={{ fontSize: FONT.md, fontWeight: 700, color: variant.text, lineHeight: 1.4 }}>{title}</Typography>}
        <Typography sx={{ fontSize: FONT.sm, color: variant.text, lineHeight: 1.4 }}>{message}</Typography>
      </Box>
    </Box>
  );
}

export default StatusMessage;
