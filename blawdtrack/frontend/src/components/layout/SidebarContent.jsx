import { Box } from '@mui/material';
import SidebarBrand from './SidebarBrand';
import SidebarComingSoon from './SidebarComingSoon';
import SidebarNavGroup from './SidebarNavGroup';
import SidebarSettingsLink from './SidebarSettingsLink';
import SidebarUserFooter from './SidebarUserFooter';
import { useFlyoutHover } from '../../hooks/useFlyoutHover';

/**
 * Contenido de la barra lateral: marca, grupos de navegación, la tuerca de ajustes (si el rol tiene ajustes) y pie con
 * el usuario y el botón de cerrar sesión.
 * @param {{ modules: Array, settings?: object|null, user: { fullName: string, email: string }, roleLabel: string,
 *   onLogout: Function, collapsed?: boolean, onToggleCollapsed?: Function }} props
 */
export default function SidebarContent({ modules, settings = null, user, roleLabel, onLogout, collapsed = false, onToggleCollapsed }) {
  const flyout = useFlyoutHover();

  return (
    <Box
      // Alto fijo: el encabezado y el pie siempre se ven; solo la lista de opciones se desplaza si no cabe.
      sx={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#1A3C34' }}
    >
      <SidebarBrand collapsed={collapsed} onToggleCollapsed={onToggleCollapsed} />
      <Box
        sx={{
          px: collapsed ? 1 : 1.75,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: collapsed ? 1 : 2.25,
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        {modules.map((module) =>
          module.comingSoon ? (
            <SidebarComingSoon key={module.id} module={module} collapsed={collapsed} />
          ) : (
            <SidebarNavGroup key={module.id} group={module} collapsed={collapsed} flyout={flyout} />
          )
        )}
      </Box>
      {settings && <SidebarSettingsLink settings={settings} collapsed={collapsed} />}
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
