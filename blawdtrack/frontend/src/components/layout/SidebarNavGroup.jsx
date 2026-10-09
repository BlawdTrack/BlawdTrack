import { Box, Typography } from '@mui/material';
import SidebarNavItem from './SidebarNavItem';

/** @param {{ group: { title: string, items: Array } }} props Un grupo del menú con su título y sus ítems. */
export default function SidebarNavGroup({ group }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <Typography
        sx={{
          px: 1.5,
          pb: '10px',
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,.35)',
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
