import { Box, Typography } from '@mui/material';
import { CARD_PATTERN_SX, RADIUS } from '../theme';
import blawdtrackLogo from '../assets/Logo.png';

/**
 * Marco común de las pantallas de recuperación de contraseña: fondo crema, marca arriba y una tarjeta
 * centrada con el acento naranja. Los hijos van dentro de la tarjeta.
 * @param {{ children: import('react').ReactNode }} props
 */
export default function AuthCardLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 4 },
        py: 4,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 3 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: RADIUS.sm,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img src={blawdtrackLogo} alt="BlawdTrack" style={{ width: 19, height: 23, objectFit: 'contain' }} />
        </Box>
        <Typography variant="h6" component="span" sx={{ color: 'primary.main' }}>
          BlawdTrack
        </Typography>
      </Box>

      <Box
        sx={{
          width: '100%',
          maxWidth: 450,
          ...CARD_PATTERN_SX,
          border: '1px solid', borderColor: 'neutral.border',
          borderRadius: RADIUS.md,
          overflow: 'hidden',
          boxShadow: 1,
        }}
      >
        <Box sx={{ height: 4, bgcolor: 'secondary.main' }} />
        {children}
      </Box>
    </Box>
  );
}
