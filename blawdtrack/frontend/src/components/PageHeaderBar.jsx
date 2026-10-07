import { Box } from '@mui/material';
import PageHeader from './PageHeader';

/**
 * Franja de encabezado de las pantallas del Súper Usuario: el encabezado grande (flecha de retorno,
 * título y descripción) pegado al borde izquierdo del área de contenido, también con el menú lateral
 * colapsado. El contenido de la pantalla va debajo, centrado en `PageContainer`.
 * @param {{ title: string, description?: string }} props
 */
export default function PageHeaderBar({ title, description }) {
  return (
    <Box sx={{ px: { xs: 2.5, md: 5 }, pt: { xs: 2.5, md: 5 } }}>
      <PageHeader size="large" title={title} description={description} />
    </Box>
  );
}
