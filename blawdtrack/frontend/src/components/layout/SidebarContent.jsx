import { Box } from '@mui/material';
import SidebarBrand from './SidebarBrand';
import SidebarNavGroup from './SidebarNavGroup';
import SidebarUserFooter from './SidebarUserFooter';

/**
 * Contenido de la barra lateral: marca, grupos de navegación y pie con el usuario y el botón de cerrar
 * sesión.
 * @param {{ groups: Array, user: { fullName: string, email: string }, roleLabel: string,
 *   onLogout: Function }} props
 */
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
