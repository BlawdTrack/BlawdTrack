import { Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { getNavigationForRole } from '../config/navigation';
import { ROUTES } from '../config/routes';
import { NAV_ITEM_ICONS } from '../components/layout/navIcons';
import MenuCard from '../components/MenuCard';
import PageHeader from '../components/PageHeader';
import PageContainer from '../components/PageContainer';

/**
 * Menú de un módulo (Mensajeros, Administradores, Seguridad y acceso): lista las funciones del módulo
 * que el rol puede usar, igual que el menú principal lista los módulos. Si el módulo no existe para el
 * rol, vuelve al menú principal.
 * @param {{ groupId: string }} props Id del grupo de `NAVIGATION_GROUPS`.
 */
export default function ModuleMenuPage({ groupId }) {
  const { user } = useAuth();
  const group = getNavigationForRole(user.role).find((candidate) => candidate.id === groupId);

  if (!group) return <Navigate to={ROUTES.MAIN_MENU} replace />;

  return (
    <>
      {/* El encabezado va pegado al borde izquierdo del área de contenido (también con el menú lateral
          colapsado); las tarjetas siguen centradas en el contenedor común. */}
      <Box sx={{ px: { xs: 2.5, md: 5 }, pt: { xs: 2.5, md: 5 } }}>
        <PageHeader size="large" title={group.title} description={group.description} />
      </Box>

      <PageContainer>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
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
    </>
  );
}
