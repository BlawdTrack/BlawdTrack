import { Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { getNavigationForRole } from '../config/navigation';
import { ROUTES } from '../config/routes';
import { NAV_ITEM_ICONS } from '../components/layout/navIcons';
import MenuCard from '../components/MenuCard';
import PageHeaderBar from '../components/PageHeaderBar';
import PageContainer from '../components/PageContainer';
import Toast from '../components/Toast';
import { useRouteNotice } from '../hooks/useRouteNotice';

/**
 * Menú de un módulo (Mensajeros, Administradores, Seguridad y acceso): lista las funciones del módulo
 * que el rol puede usar, igual que el menú principal lista los módulos. Si el módulo no existe para el
 * rol, vuelve al menú principal.
 * @param {{ groupId: string }} props Id del grupo de `NAVIGATION_GROUPS`.
 */
export default function ModuleMenuPage({ groupId }) {
  const { user } = useAuth();
  const { notice, open: noticeOpen, close: closeNotice } = useRouteNotice();
  const group = getNavigationForRole(user.role).find((candidate) => candidate.id === groupId);

  if (!group) return <Navigate to={ROUTES.MAIN_MENU} replace />;

  return (
    <>
      <PageHeaderBar title={group.title} description={group.description} />

      <PageContainer wide>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            // Una columna en móvil y, desde escritorio, una columna por función (hasta tres) para que queden lado a lado.
            gridTemplateColumns: { xs: '1fr', md: `repeat(${Math.min(group.items.length, 3)}, 1fr)` },
          }}
        >
          {group.items.map((item) => (
            <MenuCard
              key={item.id}
              to={item.path}
              icon={NAV_ITEM_ICONS[item.id]}
              title={item.label}
              description={item.description}
            />
          ))}
        </Box>
      </PageContainer>

      <Toast
        open={noticeOpen}
        message={notice?.message ?? ''}
        severity={notice?.severity}
        onClose={closeNotice}
      />
    </>
  );
}
