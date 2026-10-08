import { NavLink } from 'react-router-dom';
import { Box, Tooltip, Typography } from '@mui/material';
import { NAV_ITEM_ICONS } from './navIcons';
import { RADIUS } from '../../theme';

function ItemContent({ label, active, disabled, Icon }) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 44,
        px: 1.75,
        ml: '3px',
        borderRadius: RADIUS.sm,
        display: 'flex',
        alignItems: 'center',
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
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: active ? 600 : 500,
          color: active ? 'common.white' : disabled ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.85)',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

/**
 * Un ítem del menú lateral. Si no tiene ruta (`path: null`) se muestra deshabilitado con el aviso
 * "Disponible próximamente"; si la tiene, resalta cuando es la ruta activa.
 * @param {{ item: { id: string, label: string, path: string|null } }} props
 */
export default function SidebarNavItem({ item }) {
  const Icon = NAV_ITEM_ICONS[item.id];

  if (!item.path) {
    return (
      <Tooltip title="Disponible próximamente" placement="right" arrow>
        <span>
          <ItemContent label={item.label} active={false} disabled Icon={Icon} />
        </span>
      </Tooltip>
    );
  }

  return (
    <NavLink to={item.path} end className="sidebar-nav-link" style={{ textDecoration: 'none' }}>
      {({ isActive }) => <ItemContent label={item.label} active={isActive} disabled={false} Icon={Icon} />}
    </NavLink>
  );
}
