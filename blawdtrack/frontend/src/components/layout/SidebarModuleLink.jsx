import { NavLink, useLocation } from 'react-router-dom';
import { Box, Tooltip, Typography } from '@mui/material';
import { NAV_GROUP_ICONS } from './navIcons';
import { isGroupActive } from '../../config/navigation';
import { RADIUS, FONT } from '../../theme';

/**
 * Módulo de una sola pantalla en el menú lateral: no se despliega, lleva directo a su pantalla. Expandido es una fila
 * con el título (crema, con el fondo naranja suave si es la pantalla actual); colapsado, solo el icono con su rótulo al
 * pasar el cursor.
 * @param {{ group: { id: string, title: string, path: string, items: Array }, collapsed?: boolean }} props
 */
export default function SidebarModuleLink({ group, collapsed = false }) {
  const { pathname } = useLocation();
  const Icon = NAV_GROUP_ICONS[group.id];
  const active = isGroupActive(group, pathname);

  return (
    <Tooltip title={collapsed ? group.title : ''} placement="right" arrow>
      <Box
        component={NavLink}
        to={group.path}
        data-testid={`nav-${group.path}`}
        aria-label={group.title}
        sx={{
          alignSelf: collapsed ? 'center' : 'stretch',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          width: collapsed ? 44 : '100%',
          minHeight: 44,
          '@media (pointer: fine)': { minHeight: collapsed ? 44 : 38 },
          px: collapsed ? 0 : 1.5,
          borderRadius: RADIUS.sm,
          textDecoration: 'none',
          color: active ? '#FF6C0E' : collapsed ? 'rgba(255,255,255,.75)' : '#FAF8F5',
          backgroundColor: active ? 'rgba(255,108,14,.18)' : 'transparent',
          transition: 'background-color .15s ease',
          '&:hover': { backgroundColor: active ? 'rgba(255,108,14,.18)' : 'rgba(255,255,255,.08)' },
          '&:focus-visible': { outline: '2px solid #FF6C0E', outlineOffset: 1 },
        }}
      >
        {collapsed ? (
          Icon && <Icon aria-hidden sx={{ fontSize: FONT.xl }} />
        ) : (
          <Typography component="span" sx={{ fontSize: FONT.sm, fontWeight: 600, color: active ? '#FAF8F5' : 'inherit' }}>
            {group.title}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}
