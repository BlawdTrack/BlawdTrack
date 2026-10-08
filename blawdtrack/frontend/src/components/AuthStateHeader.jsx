import { Box, Typography } from '@mui/material';

const TONES = {
  accent: { bg: 'secondary.light', fg: 'secondary.dark' },
  success: { bg: 'success.light', fg: 'success.main' },
  error: { bg: 'error.light', fg: 'error.main' },
};

/**
 * Cabecera de cada vista de las pantallas de recuperación de contraseña: un círculo con icono, el título y,
 * si hace falta, una línea que explica qué hacer. Mismo tamaño y orden en todas las vistas del flujo.
 * @param {{ icon: import('react').ElementType, tone?: 'accent'|'success'|'error', title: string,
 *   description?: import('react').ReactNode }} props
 */
export default function AuthStateHeader({ icon: Icon, tone = 'accent', title, description }) {
  const { bg, fg } = TONES[tone];
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, textAlign: 'center' }}>
      <Box
        aria-hidden
        sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon sx={{ fontSize: 32 }} />
      </Box>
      <Typography component="h1" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: 24, color: 'primary.main' }}>
        {title}
      </Typography>
      {description && (
        <Typography component="div" sx={{ fontSize: 16, color: 'text.secondary', lineHeight: 1.55 }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}
