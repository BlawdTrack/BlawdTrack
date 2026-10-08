import { Box, Typography } from '@mui/material';
import { CARD_PATTERN_SX } from '../theme';
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
            width: 40,
            height: 40,
            borderRadius: '10px',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img src={blawdtrackLogo} alt="BlawdTrack" style={{ width: 24, height: 29, objectFit: 'contain' }} />
        </Box>
        <Typography variant="h6" component="span" sx={{ color: 'primary.main' }}>
          BlawdTrack
        </Typography>
      </Box>

      <Box
        sx={{
          width: '100%',
          maxWidth: 560,
          ...CARD_PATTERN_SX,
          border: '1px solid #E4DED7',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 16px 38px rgba(26,60,52,.07)',
        }}
      >
        <Box sx={{ height: 4, bgcolor: 'secondary.main' }} />
        {children}
      </Box>
    </Box>
  );
}
