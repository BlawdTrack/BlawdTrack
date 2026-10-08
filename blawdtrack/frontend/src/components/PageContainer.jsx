import { Box } from '@mui/material';

/** Ancho máximo del contenido de todas las pantallas dentro del menú principal. */
export const PAGE_MAX_WIDTH = 900;

/**
 * Contenedor común de las pantallas del Súper Usuario: mismo ancho máximo, márgenes y separación entre
 * bloques en todas, para que ninguna se vea más ancha, más pegada al borde o más apretada que otra.
 * @param {{ children: import('react').ReactNode, component?: string, wide?: boolean, sx?: object }} props
 *   `wide` quita el ancho máximo (para pantallas de dos paneles que aprovechan todo el espacio, con el mismo
 *   margen lateral que el encabezado); `sx` agrega estilos propios de la pantalla.
 */
export default function PageContainer({ children, component = 'div', wide = false, sx }) {
  return (
    <Box
      component={component}
      sx={{
        width: '100%',
        maxWidth: wide ? 'none' : PAGE_MAX_WIDTH,
        mx: 'auto',
        boxSizing: 'border-box',
        px: { xs: 2.5, md: wide ? 5 : 4 },
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
