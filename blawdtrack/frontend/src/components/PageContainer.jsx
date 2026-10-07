import { Box } from '@mui/material';

/** Ancho máximo del contenido de todas las pantallas dentro del menú principal. */
export const PAGE_MAX_WIDTH = 1120;

/**
 * Contenedor común de las pantallas del Súper Usuario: mismo ancho máximo, márgenes y separación entre
 * bloques en todas, para que ninguna se vea más ancha, más pegada al borde o más apretada que otra.
 * @param {{ children: import('react').ReactNode, component?: string, sx?: object }} props `sx` agrega
 *   estilos propios de la pantalla (por ejemplo, centrar el contenido en vertical).
 */
export default function PageContainer({ children, component = 'div', sx }) {
  return (
    <Box
      component={component}
      sx={{
        width: '100%',
        maxWidth: PAGE_MAX_WIDTH,
        mx: 'auto',
        boxSizing: 'border-box',
        px: { xs: 2.5, md: 4 },
        py: { xs: 2.5, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
