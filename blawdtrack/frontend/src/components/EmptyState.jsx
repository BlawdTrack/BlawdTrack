import { Box, Paper, Typography } from '@mui/material';
import { CARD_SX } from './formStyles';
import { RADIUS } from '../theme';

/**
 * Tarjeta de "todavía no hay nada seleccionado": icono, título y una línea que dice qué hacer.
 * @param {{ icon: import('react').ElementType, title: string, description: string, sx?: object }} props
 *   `sx` ajusta la tarjeta (por ejemplo, ocultarla en móvil).
 */
export default function EmptyState({ icon: Icon, title, description, sx }) {
  return (
    <Paper
      elevation={0}
      sx={{
        ...CARD_SX,
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        textAlign: 'center',
        ...sx,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: RADIUS.md,
          bgcolor: 'secondary.light',
          color: 'secondary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon sx={{ fontSize: 36 }} />
      </Box>
      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 18, color: 'primary.main' }}>{title}</Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 16, maxWidth: 360 }}>{description}</Typography>
    </Paper>
  );
}
