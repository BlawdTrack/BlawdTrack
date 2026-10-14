import { Box } from '@mui/material';
import AuthBrandPanel from './AuthBrandPanel';
import BrandLogo from './BrandLogo';
import { CARD_PATTERN_SX, RADIUS, rem } from '../theme';

/**
 * Marco de las pantallas de acceso (inicio de sesión y recuperación de contraseña): el panel verde de la marca a la
 * izquierda (42 % del ancho) y, a la derecha, el fondo con el patrón de la app y una tarjeta blanca de 520 px con el
 * contenido. En el teléfono el panel verde no se ve y la marca va sobre la tarjeta.
 * @param {{ brandTitle: import('react').ReactNode, brandSubtitle: string, children: import('react').ReactNode }} props
 *   `brandTitle` y `brandSubtitle` son el titular y el texto del panel verde; los hijos van dentro de la tarjeta.
 */
export default function AuthSplitLayout({ brandTitle, brandSubtitle, children }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      <AuthBrandPanel sx={{ flex: '0 0 42%' }} title={brandTitle} subtitle={brandSubtitle} />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2.5, sm: 4 },
          py: 4,
        }}
      >
        {/* En móvil el panel de marca no se ve, así que la marca va sobre el formulario. */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 2 }}>
          <BrandLogo variant="stacked" width={104} />
        </Box>

        <Box
          sx={{
            width: '100%',
            maxWidth: rem(520),
            ...CARD_PATTERN_SX,
            border: '1px solid',
            borderColor: 'neutral.border',
            borderRadius: RADIUS.lg,
            p: { xs: 3, sm: 6 },
            display: 'flex',
            flexDirection: 'column',
            gap: 3.5,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
