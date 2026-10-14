import { Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { getMenuForRole } from '../config/navigation';
import { ROUTES } from '../config/routes';
import { getHomeRoute } from '../utils/roleRoutes';
import { NAV_GROUP_ICONS, NAV_ITEM_ICONS } from '../components/layout/navIcons';
import ActionCard from '../components/ActionCard';
import PageHeaderBar from '../components/PageHeaderBar';
import PageContainer from '../components/PageContainer';
import Toast from '../components/Toast';
import { useRouteNotice } from '../hooks/useRouteNotice';
import { rem } from '../theme';

/**
 * Menú de un módulo (Usuarios, Paquetes, Seguridad y acceso) o de un submenú (Mensajeros, Administradores): lista las funciones
 * que el rol puede usar (o, en Gestión de usuarios, sus submenús), igual que el menú principal lista los módulos. Si no existe para el
 * rol, vuelve al menú principal.
 * @param {{ groupId: string }} props Id de un grupo o de un submenú de `NAVIGATION_MENUS`.
 */
export default function ModuleMenuPage({ groupId }) {
  const { user } = useAuth();
  const { notice, open: noticeOpen, close: closeNotice } = useRouteNotice();
  const menu = getMenuForRole(user.role, groupId);

  if (!menu) return <Navigate to={getHomeRoute(user.role) ?? ROUTES.MAIN_MENU} replace />;

  const itemCard = (item) => ({
    id: item.id,
    to: item.path,
    icon: NAV_ITEM_ICONS[item.id],
    title: item.label,
    description: item.description,
    actionLabel: item.actionLabel,
    tone: item.tone,
  });
  // Un grupo con submenús (Gestión de usuarios) lista esos submenús y, después, sus funciones propias; los demás,
  // sus funciones.
  const cards = menu.submenus
    ? [
        ...menu.submenus.map((submenu) => ({
          id: submenu.id,
          to: submenu.path,
          icon: NAV_GROUP_ICONS[submenu.id],
          title: submenu.title,
          description: submenu.description,
          actionLabel: submenu.actionLabel,
        })),
        ...(menu.directItems ?? []).map(itemCard),
      ]
    : menu.items.map(itemCard);

  return (
    <>
      <PageHeaderBar title={menu.title} />

      {/* Las funciones van pegadas bajo el encabezado, con aire entre ambos, en vez de flotar en medio de la pantalla. */}
      <PageContainer sx={{ maxWidth: rem(1100), pt: { xs: 3, md: 6 } }}>
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            // Una columna en móvil y, desde escritorio, una columna por función (hasta tres) para que queden lado a lado.
            gridTemplateColumns: { xs: '1fr', md: `repeat(${Math.min(cards.length, 3)}, 1fr)` },
          }}
        >
          {cards.map(({ id, ...card }) => (
            <ActionCard key={id} {...card} />
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
