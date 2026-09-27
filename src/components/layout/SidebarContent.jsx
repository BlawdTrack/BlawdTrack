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
      <Box sx={{ height: 4, backgroundColor: '#FF6C0E', flex: '0 0 4px' }} />
      <SidebarBrand />
      <Box sx={{ px: 1.5, pb: 2.5, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
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
