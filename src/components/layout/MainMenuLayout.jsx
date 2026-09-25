import { Outlet, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { getNavigationForRole } from '../../config/navigation';
import { ROLE_LABELS } from '../../config/roles';
import { ROUTES } from '../../config/routes';
import SidebarBrand from './SidebarBrand';
import SidebarNavGroup from './SidebarNavGroup';
import SidebarUserFooter from './SidebarUserFooter';

export default function MainMenuLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const groups = getNavigationForRole(user.role);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FAF8F5' }}>
      <Box
        component="aside"
        sx={{
          flex: '0 0 272px',
          width: 272,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          backgroundColor: '#1A3C34',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'auto',
        }}
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
          roleLabel={ROLE_LABELS[user.role] ?? user.role}
          onLogout={handleLogout}
        />
      </Box>
      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
