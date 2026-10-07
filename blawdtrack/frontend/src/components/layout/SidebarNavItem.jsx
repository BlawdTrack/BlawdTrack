import { NavLink } from 'react-router-dom';
import { Box, Tooltip, Typography } from '@mui/material';
import { NAV_ITEM_ICONS } from './navIcons';

function ItemContent({ label, active, disabled, collapsed, Icon }) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 44,
        px: collapsed ? 0 : 1.75,
        ml: '3px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 1.5,
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: active ? 'rgba(255,108,14,.18)' : 'transparent',
        transition: 'background-color .15s ease',
        '&:hover': { backgroundColor: disabled ? 'transparent' : active ? 'rgba(255,108,14,.18)' : 'rgba(255,255,255,.08)' },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: '-3px',
          top: '20%',
          bottom: '20%',
          width: '3px',
          borderRadius: '3px',
          backgroundColor: active ? '#FF6C0E' : 'transparent',
        },
      }}
    >
      {Icon && (
        <Icon
          sx={{
            fontSize: 20,
            flex: '0 0 20px',
            color: active ? '#FF6C0E' : disabled ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.7)',
          }}
        />
      )}
      {!collapsed && (
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: active ? 600 : 500,
            color: active ? '#fff' : disabled ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.85)',
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
}

/**
 * Un ítem del menú lateral. Si no tiene ruta (`path: null`) se muestra deshabilitado con el aviso
 * "Disponible próximamente"; si la tiene, resalta cuando es la ruta activa. Con la barra colapsada solo
 * muestra el icono y el nombre pasa a un tooltip.
 * @param {{ item: { id: string, label: string, path: string|null }, collapsed?: boolean }} props
 */
export default function SidebarNavItem({ item, collapsed = false }) {
  const Icon = NAV_ITEM_ICONS[item.id];

  if (!item.path) {
    return (
      <Tooltip
        title={collapsed ? `${item.label} · Disponible próximamente` : 'Disponible próximamente'}
        placement="right"
        arrow
      >
        <span>
          <ItemContent label={item.label} active={false} disabled collapsed={collapsed} Icon={Icon} />
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={collapsed ? item.label : ''} placement="right" arrow>
      <NavLink
        to={item.path}
        end
        className="sidebar-nav-link"
        aria-label={collapsed ? item.label : undefined}
        style={{ textDecoration: 'none' }}
      >
        {({ isActive }) => (
          <ItemContent label={item.label} active={isActive} disabled={false} collapsed={collapsed} Icon={Icon} />
        )}
      </NavLink>
    </Tooltip>
  );
}
