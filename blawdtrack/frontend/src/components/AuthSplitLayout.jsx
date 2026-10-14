import { Box } from '@mui/material';
import AuthBrandPanel from './AuthBrandPanel';
import BrandLogo from './BrandLogo';
import { AUTH_CREAM } from './authStyles';
import { rem } from '../theme';

/**
 * Marco de las pantallas de recuperación de contraseña: dos columnas (.9fr / 1fr) con el panel verde de la marca
 * a la izquierda y, a la derecha, un crema liso (sin patrón ni tarjeta) con el contenido en una columna de 400 px.
 * En el teléfono el panel verde no se ve y la marca va sobre el contenido.
 * @param {{ brandTitle: import('react').ReactNode, brandSubtitle: string, children: import('react').ReactNode }} props
 *   `brandTitle` y `brandSubtitle` son el titular y el texto del panel verde.
 */
export default function AuthSplitLayout({ brandTitle, brandSubtitle, children }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '0.9fr 1fr' } }}>
      <AuthBrandPanel title={brandTitle} subtitle={brandSubtitle} />

      <Box
        component="main"
        sx={{ bgcolor: AUTH_CREAM, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: { xs: 2.5, sm: 4 }, py: 4 }}
      >
        {/* En el teléfono el panel verde no se ve, así que la marca va sobre el formulario. */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 2 }}>
          <BrandLogo variant="stacked" width={104} />
        </Box>
        <Box sx={{ width: '100%', maxWidth: rem(400) }}>{children}</Box>
      </Box>
    </Box>
  );
}
