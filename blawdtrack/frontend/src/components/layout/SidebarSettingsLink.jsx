import { NavLink, useLocation } from 'react-router-dom';
import { Box, Tooltip, Typography } from '@mui/material';
import { NAV_GROUP_ICONS } from './navIcons';
import { isGroupActive } from '../../config/navigation';
import { RADIUS, FONT } from '../../theme';

const ACTIVE_COLOR = '#FF6C0E';
const ACTIVE_BG = 'rgba(255,108,14,.18)';

/** Estilos del enlace según esté activo y la barra colapsada (aparte para que el componente solo componga). */
function linkSx(active, collapsed) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    width: collapsed ? 44 : '100%',
    minHeight: 44,
    '@media (pointer: fine)': { minHeight: collapsed ? 44 : 38 },
    justifyContent: collapsed ? 'center' : 'flex-start',
    px: collapsed ? 0 : 1.75,
    borderRadius: RADIUS.sm,
    textDecoration: 'none',
    color: active ? ACTIVE_COLOR : 'rgba(255,255,255,.75)',
    backgroundColor: active ? ACTIVE_BG : 'transparent',
    transition: 'background-color .15s ease',
    '&:hover': { backgroundColor: active ? ACTIVE_BG : 'rgba(255,255,255,.08)' },
    '&:focus-visible': { outline: `2px solid ${ACTIVE_COLOR}`, outlineOffset: 1 },
  };
}

/**
 * Tuerca de ajustes al pie de la barra lateral, encima del usuario: lleva al menú de ajustes desde cualquier pantalla.
 * Expandida es una fila con el icono y "Ajustes"; colapsada, solo el icono con su rótulo al pasar el cursor.
 * @param {{ settings: { title: string, path: string, items: Array }, collapsed?: boolean }} props `settings` es el menú
 *   de ajustes del rol (`getSettingsForRole`).
 */
export default function SidebarSettingsLink({ settings, collapsed = false }) {
  const { pathname } = useLocation();
  const Icon = NAV_GROUP_ICONS[settings.id];
  const active = isGroupActive(settings, pathname);

  return (
    <Box sx={{ px: collapsed ? 1 : 1.75, pb: 1, display: 'flex', justifyContent: collapsed ? 'center' : 'stretch' }}>
      <Tooltip title={collapsed ? settings.title : ''} placement="right" arrow>
        <Box
          component={NavLink}
          to={settings.path}
          data-testid={`nav-${settings.path}`}
          aria-label={settings.title}
          sx={linkSx(active, collapsed)}
        >
          {Icon && <Icon sx={{ fontSize: FONT.xl }} />}
          {!collapsed && (
            <Typography component="span" sx={{ fontSize: FONT.sm, fontWeight: active ? 600 : 500, color: active ? 'common.white' : 'rgba(255,255,255,.85)' }}>
              {settings.title}
            </Typography>
          )}
        </Box>
      </Tooltip>
    </Box>
  );
}
