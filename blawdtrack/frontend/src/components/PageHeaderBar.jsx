import { Box } from '@mui/material';
import PageHeader from './PageHeader';

/**
 * Franja de encabezado de las pantallas del Súper Usuario: el encabezado (ruta de migas, enlace al menú
 * principal y título) a todo el ancho del área de contenido, también con el menú lateral colapsado. El
 * contenido de la pantalla va debajo, centrado en `PageContainer`.
 * @param {{ title: string }} props
 */
export default function PageHeaderBar({ title }) {
  return (
    <Box sx={{ px: { xs: 2.5, md: 5 }, pt: { xs: 2.5, md: 5 } }}>
      <PageHeader title={title} />
    </Box>
  );
}
