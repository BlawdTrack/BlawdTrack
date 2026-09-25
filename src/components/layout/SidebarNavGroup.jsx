import { Box, Typography } from '@mui/material';
import SidebarNavItem from './SidebarNavItem';

export default function SidebarNavGroup({ group }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <Typography
        sx={{ px: 1.5, pt: 1, pb: 0.5, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.1, textTransform: 'uppercase', color: 'rgba(255,255,255,.72)' }}
      >
        {group.title}
      </Typography>
      {group.items.map((item) => (
        <SidebarNavItem key={item.id} item={item} />
      ))}
    </Box>
  );
}
