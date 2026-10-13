import { Box } from '@mui/material';

/**
 * Contenido de una pestaña. Todos los paneles se mantienen montados y solo el activo se muestra, así lo
 * escrito en un formulario no se pierde al cambiar de pestaña.
 * @param {{ id: string, active: boolean, children: import('react').ReactNode }} props `id` enlaza con
 *   la pestaña `tab-{id}` que lo controla.
 */
export default function TabPanel({ id, active, children }) {
  return (
    <Box
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      hidden={!active}
      sx={{ display: active ? 'flex' : 'none', flexDirection: 'column', flex: 1, minHeight: 0 }}
    >
      {children}
    </Box>
  );
}
