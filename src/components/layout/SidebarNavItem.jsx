import { NavLink } from 'react-router-dom';
import { Box, Tooltip, Typography } from '@mui/material';
import { NAV_ITEM_ICONS } from './navIcons';

function ItemContent({ label, active, disabled, Icon }) {
  return (
    <Box
      sx={{
        position: 'relative',
        px: 1.75,
        py: 1.15,
        ml: '3px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: active ? 'rgba(255,108,14,.14)' : 'transparent',
        transition: 'background-color .15s ease',
        '&:hover': { backgroundColor: disabled ? 'transparent' : active ? 'rgba(255,108,14,.14)' : 'rgba(255,255,255,.06)' },
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
            fontSize: 18,
            flex: '0 0 18px',
            color: active ? '#FF6C0E' : disabled ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.55)',
          }}
        />
      )}
      <Typography
        sx={{
          fontSize: 13.5,
          fontWeight: active ? 600 : 500,
          color: active ? '#fff' : disabled ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.75)',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

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
    <NavLink to={item.path} end style={{ textDecoration: 'none' }}>
      {({ isActive }) => <ItemContent label={item.label} active={isActive} disabled={false} Icon={Icon} />}
    </NavLink>
  );
}
