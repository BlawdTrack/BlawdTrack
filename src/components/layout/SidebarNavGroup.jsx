import { Box, Typography } from '@mui/material';
import SidebarNavItem from './SidebarNavItem';

export default function SidebarNavGroup({ group }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <Typography
        sx={{
          px: 1.5,
          pt: 1,
          pb: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: '#FF6C0E',
          '&::after': {
            content: '""',
            flex: 1,
            height: '1px',
            backgroundColor: 'rgba(255,108,14,.3)',
          },
        }}
      >
        {group.title}
      </Typography>
      {group.items.map((item) => (
        <SidebarNavItem key={item.id} item={item} />
      ))}
    </Box>
  );
}
