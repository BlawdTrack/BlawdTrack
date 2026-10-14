import { Box, Typography } from '@mui/material';
import { FONT, fontPx } from '../theme';

const TONES = {
  accent: { bg: 'secondary.light', fg: 'secondary.text' },
  success: { bg: 'success.light', fg: 'success.main' },
  error: { bg: 'error.light', fg: 'error.main' },
};

/**
 * Cabecera de cada vista de las pantallas de recuperación de contraseña: un cuadro redondeado con icono, el título y,
 * si hace falta, una línea que explica qué hacer, todo alineado a la izquierda. Mismo tamaño y orden en todas las
 * vistas del flujo.
 * @param {{ icon: import('react').ElementType, tone?: 'accent'|'success'|'error', title: string,
 *   description?: import('react').ReactNode }} props
 */
export default function AuthStateHeader({ icon: Icon, tone = 'accent', title, description }) {
  const { bg, fg } = TONES[tone];
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1.5, textAlign: 'left' }}>
      <Box
        aria-hidden
        sx={{ width: 60, height: 60, borderRadius: '16px', bgcolor: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon sx={{ fontSize: FONT.h1 }} />
      </Box>
      <Typography
        component="h1"
        sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: fontPx(34), lineHeight: 1.15, color: 'primary.main' }}
      >
        {title}
      </Typography>
      {description && (
        <Typography component="div" sx={{ fontSize: FONT.lg, color: 'text.secondary', lineHeight: 1.55 }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}
