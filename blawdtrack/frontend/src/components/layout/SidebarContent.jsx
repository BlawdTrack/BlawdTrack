import { Box } from '@mui/material';
import SidebarBrand from './SidebarBrand';
import SidebarNavGroup from './SidebarNavGroup';
import SidebarUserFooter from './SidebarUserFooter';
import { useFlyoutHover } from '../../hooks/useFlyoutHover';

/**
 * Contenido de la barra lateral: marca, grupos de navegación y pie con el usuario y el botón de cerrar
 * sesión.
 * @param {{ groups: Array, user: { fullName: string, email: string }, roleLabel: string,
 *   onLogout: Function, collapsed?: boolean, onToggleCollapsed?: Function }} props
 */
export default function SidebarContent({ groups, user, roleLabel, onLogout, collapsed = false, onToggleCollapsed }) {
  const flyout = useFlyoutHover();

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: '#1A3C34' }}
    >
      <SidebarBrand collapsed={collapsed} onToggleCollapsed={onToggleCollapsed} />
      <Box
        sx={{
          px: collapsed ? 1 : 1.75,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: collapsed ? 1 : 2.25,
          overflowY: 'auto',
        }}
      >
        {groups.map((group) => (
          <SidebarNavGroup key={group.id} group={group} collapsed={collapsed} flyout={flyout} />
        ))}
      </Box>
      <SidebarUserFooter
        fullName={user.fullName}
        email={user.email}
        roleLabel={roleLabel}
        onLogout={onLogout}
        collapsed={collapsed}
      />
    </Box>
  );
}
