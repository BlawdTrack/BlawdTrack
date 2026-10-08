import { Box } from '@mui/material';
import { CARD_PATTERN_SX, RADIUS } from '../theme';
import BrandLogo from './BrandLogo';

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
      <Box sx={{ mb: 1 }}>
        <BrandLogo variant="stacked" width={104} />
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
