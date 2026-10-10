import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { getNavigationForRole } from '../../config/navigation';
import { ROLE_LABELS } from '../../config/roles';
import { ROUTES } from '../../config/routes';
import SidebarContent from './SidebarContent';
import MobileBottomNav from './MobileBottomNav';
import { rem } from '../../theme';

// La barra no baja de 208 px aunque la raíz sea chica: el texto de las etiquetas no baja de 12 px.
const SIDEBAR_WIDTH = `max(208px, ${rem(220)})`;
const SIDEBAR_COLLAPSED_WIDTH = `max(64px, ${rem(62)})`;
const COLLAPSED_STORAGE_KEY = 'blawdtrack.sidebarCollapsed';

// El navegador puede bloquear el almacenamiento (modo privado); en ese caso la barra arranca expandida.
const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};


/**
 * Diseño del menú principal del Super Usuario: barra lateral en escritorio, barra de pestañas inferior
 * en el teléfono y, en el centro, la pantalla de la ruta hija (`<Outlet />`). El menú sale de
 * `getNavigationForRole` según el rol del usuario autenticado.
 */
export default function MainMenuLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const groups = getNavigationForRole(user.role);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const handleToggleCollapsed = () => {
    setCollapsed((current) => {
      try {
        localStorage.setItem(COLLAPSED_STORAGE_KEY, String(!current));
      } catch {
        // Sin almacenamiento la elección solo dura la sesión de la pestaña.
      }
      return !current;
    });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        component="aside"
        sx={{
          flex: `0 0 ${sidebarWidth}`,
          width: sidebarWidth,
          transition: 'width .2s ease, flex-basis .2s ease',
          display: { xs: 'none', md: 'block' },
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'auto',
          backgroundColor: '#1A3C34',
          '& a.sidebar-nav-link:focus-visible': { outline: 'none' },
          '& a.sidebar-nav-link:focus-visible > div': { outline: '2px solid #FF6C0E', outlineOffset: 1 },
        }}
      >
        <SidebarContent
          groups={groups}
          user={user}
          roleLabel={ROLE_LABELS[user.role] ?? user.role}
          onLogout={handleLogout}
          collapsed={collapsed}
          onToggleCollapsed={handleToggleCollapsed}
        />
      </Box>

      <Box component="main" sx={{ flex: 1, minWidth: 0, pb: { xs: '72px', md: 0 } }}>
        <Outlet />
      </Box>

      <MobileBottomNav groups={groups} />
    </Box>
  );
}
