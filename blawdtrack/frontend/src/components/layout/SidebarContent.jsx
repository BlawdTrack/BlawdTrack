import { Box } from '@mui/material';
import SidebarBrand from './SidebarBrand';
import SidebarNavGroup from './SidebarNavGroup';
import SidebarUserFooter from './SidebarUserFooter';

// Sidebar body shared by the desktop panel and the mobile drawer.
export default function SidebarContent({ groups, user, roleLabel, onLogout }) {
  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: '#1A3C34' }}
    >
      <SidebarBrand />
      <Box sx={{ px: 1.75, py: 2, display: 'flex', flexDirection: 'column', gap: 2.25, overflowY: 'auto' }}>
        {groups.map((group) => (
          <SidebarNavGroup key={group.id} group={group} />
        ))}
      </Box>
      <SidebarUserFooter
        fullName={user.fullName}
        email={user.email}
        roleLabel={roleLabel}
        onLogout={onLogout}
      />
    </Box>
  );
}
