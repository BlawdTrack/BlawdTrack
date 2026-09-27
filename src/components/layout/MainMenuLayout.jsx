import { Outlet, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { getNavigationForRole } from '../../config/navigation';
import { ROLE_LABELS } from '../../config/roles';
import { ROUTES } from '../../config/routes';
import SidebarContent from './SidebarContent';
import MobileBottomNav from './MobileBottomNav';

const SIDEBAR_WIDTH = 272;

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
          flex: `0 0 ${SIDEBAR_WIDTH}px`,
          width: SIDEBAR_WIDTH,
          display: { xs: 'none', md: 'block' },
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'auto',
          backgroundColor: '#1A3C34',
        }}
      >
        <SidebarContent
          groups={groups}
          user={user}
          roleLabel={ROLE_LABELS[user.role] ?? user.role}
          onLogout={handleLogout}
        />
      </Box>

      <Box component="main" sx={{ flex: 1, minWidth: 0, pb: { xs: '84px', md: 0 } }}>
        <Outlet />
      </Box>

      <MobileBottomNav groups={groups} />
    </Box>
  );
}
