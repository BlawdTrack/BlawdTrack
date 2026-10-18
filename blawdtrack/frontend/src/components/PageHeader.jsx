import { Box, Typography } from '@mui/material';
import MainMenuLink from './MainMenuLink';
import ParentMenuArrow from './ParentMenuArrow';
import { FONT, RADIUS, fontPx } from '../theme';

/**
 * Encabezado común de las pantallas de gestión: arriba el enlace "Menú principal" (si la pantalla pertenece a un
 * módulo) y debajo el título (`h1`), con la flecha para volver al menú anterior a su lado, y una barra naranja sobre
 * una línea fina.
 * @param {{ title: string }} props
 */
export default function PageHeader({ title }) {
  return (
    <Box
      sx={{
        borderRadius: RADIUS.lg,
        // Fondo crema casi opaco: el patrón de la pantalla no se cruza con el texto del encabezado.
        bgcolor: 'rgba(250,248,245,.94)',
        px: { xs: 2.5, md: 4 },
        py: { xs: 2.5, md: 3 },
      }}
    >
      <Box sx={{ mb: 1, ml: -1.5, '&:empty': { display: 'none' } }}>
        <MainMenuLink />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ParentMenuArrow />
        <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontSize: { xs: FONT.h1, md: fontPx(38) }, fontWeight: 700 }}>
          {title}
        </Typography>
      </Box>
      <Box
        aria-hidden="true"
        sx={{
          mt: 2.5,
          height: 3,
          position: 'relative',
          '&::before': { content: '""', position: 'absolute', left: 0, bottom: 1, width: 56, height: 3, bgcolor: 'secondary.main', zIndex: 1 },
          '&::after': { content: '""', position: 'absolute', left: 0, right: 0, bottom: 1, height: 1, bgcolor: 'neutral.border' },
        }}
      />
    </Box>
  );
}
