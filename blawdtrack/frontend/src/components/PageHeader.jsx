import { Box, Typography } from '@mui/material';
import ModuleBackButton from './ModuleBackButton';

/**
 * Encabezado común de las pantallas de gestión: la flecha para volver al menú anterior (si la pantalla
 * pertenece a un módulo), el título (`h1`) y una línea que explica para qué sirve la pantalla, para que
 * el usuario sepa dónde está sin recordar el menú.
 * @param {{ title: string, description?: string }} props
 */
export default function PageHeader({ title, description }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <ModuleBackButton />
      <Box sx={{ pl: 2, borderLeft: '4px solid', borderColor: 'secondary.main' }}>
        <Typography variant="h5" component="h1" sx={{ color: 'primary.main' }}>
          {title}
        </Typography>
        {description && (
          <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: 0.5 }}>{description}</Typography>
        )}
      </Box>
    </Box>
  );
}
