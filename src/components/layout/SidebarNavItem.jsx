import { NavLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

function ItemContent({ label, active, disabled }) {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 1.25,
        borderRadius: '9px',
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        cursor: disabled ? 'default' : 'pointer',
        backgroundColor: active ? 'rgba(255,255,255,.12)' : 'transparent',
        '&:hover': { backgroundColor: disabled ? 'transparent' : 'rgba(255,255,255,.08)' },
      }}
    >
      <Box
        sx={{ width: 3, height: 16, borderRadius: '2px', flex: '0 0 3px', backgroundColor: active ? '#FF6C0E' : 'transparent' }}
      />
      <Typography
        sx={{
          fontSize: 13.5,
          fontWeight: active ? 600 : 500,
          color: active ? '#fff' : disabled ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.78)',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default function SidebarNavItem({ item }) {
  if (!item.path) return <ItemContent label={item.label} active={false} disabled />;

  return (
    <NavLink to={item.path} end style={{ textDecoration: 'none' }}>
      {({ isActive }) => <ItemContent label={item.label} active={isActive} disabled={false} />}
    </NavLink>
  );
}
