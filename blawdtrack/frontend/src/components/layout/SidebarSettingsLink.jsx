import { NavLink, useLocation } from 'react-router-dom';
import { Box, Tooltip, Typography } from '@mui/material';
import { NAV_GROUP_ICONS } from './navIcons';
import { isGroupActive } from '../../config/navigation';
import { RADIUS, FONT } from '../../theme';

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
          aria-label={settings.title}
          sx={{
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
            color: active ? '#FF6C0E' : 'rgba(255,255,255,.75)',
            backgroundColor: active ? 'rgba(255,108,14,.18)' : 'transparent',
            transition: 'background-color .15s ease',
            '&:hover': { backgroundColor: active ? 'rgba(255,108,14,.18)' : 'rgba(255,255,255,.08)' },
            '&:focus-visible': { outline: '2px solid #FF6C0E', outlineOffset: 1 },
          }}
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
