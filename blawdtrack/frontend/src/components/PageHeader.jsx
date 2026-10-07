import { Box, Typography } from '@mui/material';

/**
 * Encabezado común de las pantallas de gestión: título (`h1`) y una línea que explica para qué sirve
 * la pantalla, para que el usuario sepa dónde está sin recordar el menú.
 * @param {{ title: string, description?: string }} props
 */
export default function PageHeader({ title, description }) {
  return (
    <Box sx={{ pl: 2, borderLeft: '4px solid', borderColor: 'secondary.main' }}>
      <Typography variant="h5" component="h1" sx={{ color: 'primary.main' }}>
        {title}
      </Typography>
      {description && (
        <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: 0.5 }}>{description}</Typography>
      )}
    </Box>
  );
}
