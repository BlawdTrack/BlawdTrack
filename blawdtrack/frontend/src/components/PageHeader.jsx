import { Box, Typography } from '@mui/material';
import ModuleBackButton from './ModuleBackButton';

/**
 * Encabezado común de las pantallas de gestión: la flecha para volver al menú anterior (si la pantalla
 * pertenece a un módulo), el título (`h1`) y una línea que explica para qué sirve la pantalla, para que
 * el usuario sepa dónde está sin recordar el menú.
 * @param {{ title: string, description?: string, size?: 'default'|'large' }} props `large` es la versión
 *   grande de los menús de módulo.
 */
export default function PageHeader({ title, description, size = 'default' }) {
  const large = size === 'large';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: large ? 2.5 : 2 }}>
      <ModuleBackButton size={large ? 56 : 44} />
      <Box sx={{ pl: large ? 2.5 : 2, borderLeft: `${large ? 5 : 4}px solid`, borderColor: 'secondary.main' }}>
        <Typography
          variant={large ? 'h4' : 'h5'}
          component="h1"
          sx={{ color: 'primary.main', ...(large && { fontSize: { xs: '1.75rem', md: '2rem' } }) }}
        >
          {title}
        </Typography>
        {description && (
          <Typography sx={{ fontSize: large ? { xs: 16, md: 18 } : 14, color: 'text.secondary', mt: 0.5 }}>{description}</Typography>
        )}
      </Box>
    </Box>
  );
}
