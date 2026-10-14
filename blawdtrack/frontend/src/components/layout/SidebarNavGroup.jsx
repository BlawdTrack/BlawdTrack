import { useLocation } from 'react-router-dom';
import {
  Box,
  ClickAwayListener,
  MenuList,
  Paper,
  Popper,
  Typography,
} from '@mui/material';
import SidebarModuleLink from './SidebarModuleLink';
import SidebarNavItem from './SidebarNavItem';
import SidebarToggleSection from './SidebarToggleSection';
import { isGroupActive, isSingleScreenMenu } from '../../config/navigation';
import SidebarSubmenuFlyout, { FlyoutMenuItem } from './SidebarFlyoutItems';
import { NAV_GROUP_ICONS } from './navIcons';
import { RADIUS, FONT, rem } from '../../theme';

/**
 * Un grupo del menú (un módulo de una sola pantalla es un enlace directo, `SidebarModuleLink`). Con la barra expandida su título abre y cierra la lista de ítems (arranca cerrado
 * y, si la pantalla actual es del grupo, lo marca con un punto naranja). Con la barra colapsada el grupo
 * es un solo icono que despliega la lista de sus pantallas en un menú flotante al pasar el cursor.
 * @param {{ group: { id: string, title: string, items: Array }, collapsed?: boolean,
 *   flyout?: ReturnType<typeof import('../../hooks/useFlyoutHover').useFlyoutHover> }} props `flyout`
 *   es el controlador compartido de los menús flotantes (obligatorio con la barra colapsada).
 */
export default function SidebarNavGroup({ group, collapsed = false, flyout }) {
  const { pathname } = useLocation();
  const hasActiveItem = isGroupActive(group, pathname);
  const listId = `sidebar-group-${group.id}`;

  // Un módulo de una sola pantalla no se despliega: es un enlace directo a ella.
  if (isSingleScreenMenu(group)) return <SidebarModuleLink group={group} collapsed={collapsed} />;

  if (collapsed) {
    const GroupIcon = NAV_GROUP_ICONS[group.id];
    const menuId = `${listId}-menu`;
    const { openId, anchorEl, focusFirst, registerPanel, close, onPanelEnter, onPanelLeave } = flyout;
    const menuOpen = openId === group.id;
    const handleMenuKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Tab') {
        if (event.key === 'Escape') anchorEl?.focus();
        close();
      }
    };

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box
          component="button"
          type="button"
          onMouseEnter={(event) => flyout.onTriggerEnter(group.id, event)}
          onMouseLeave={() => flyout.onTriggerLeave(group.id)}
          onClick={(event) => flyout.onTriggerClick(group.id, event)}
          aria-label={group.title}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? menuId : undefined}
          sx={{
            width: 44,
            height: 44,
            border: 0,
            borderRadius: RADIUS.sm,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backgroundColor: hasActiveItem || menuOpen ? 'rgba(255,108,14,.18)' : 'transparent',
            color: hasActiveItem ? '#FF6C0E' : 'rgba(255,255,255,.75)',
            '&:hover': { backgroundColor: hasActiveItem ? 'rgba(255,108,14,.18)' : 'rgba(255,255,255,.08)' },
            '&:focus-visible': { outline: '2px solid #FF6C0E', outlineOffset: 1 },
          }}
        >
          {GroupIcon && <GroupIcon sx={{ fontSize: FONT.xl }} />}
        </Box>
        <Popper
          open={menuOpen}
          anchorEl={anchorEl}
          placement="right-start"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
        >
          {/* El relleno izquierdo une el icono con el menú, para que el cursor no "salga" al cruzar. */}
          <Box ref={registerPanel} onMouseEnter={onPanelEnter} onMouseLeave={onPanelLeave} sx={{ pl: 1 }}>
            {/* Un clic sobre el propio icono no es "fuera": ya lo abrió el cursor y no debe cerrarlo. */}
            <ClickAwayListener onClickAway={(event) => !anchorEl?.contains(event.target) && close()}>
              <Paper elevation={8} sx={{ minWidth: rem(176), borderRadius: RADIUS.sm, border: '1px solid', borderColor: 'neutral.border', py: 0.5 }}>
                <Typography
                  sx={{ px: 2, py: 0.75, fontSize: FONT.xs, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'text.secondary' }}
                >
                  {group.title}
                </Typography>
                {group.submenus ? (
                  <SidebarSubmenuFlyout
                    submenus={group.submenus}
                    directItems={group.directItems}
                    pathname={pathname}
                    onClose={close}
                    menuId={menuId}
                    autoFocusItem={focusFirst}
                    onKeyDown={handleMenuKeyDown}
                  />
                ) : (
                  <MenuList id={menuId} autoFocusItem={focusFirst} onKeyDown={handleMenuKeyDown}>
                    {group.items.map((item) => (
                      <FlyoutMenuItem key={item.id} item={item} active={item.path === pathname} onClick={close} />
                    ))}
                  </MenuList>
                )}
              </Paper>
            </ClickAwayListener>
          </Box>
        </Popper>
      </Box>
    );
  }

  return (
    <SidebarToggleSection id={listId} title={group.title} active={hasActiveItem}>
      {group.submenus
        ? group.submenus.map((submenu) => (
            <SidebarToggleSection
              key={submenu.id}
              id={`sidebar-group-${submenu.id}`}
              title={submenu.title}
              active={isGroupActive(submenu, pathname)}
              nested
            >
              {submenu.items.map((item) => (
                <SidebarNavItem key={item.id} item={item} />
              ))}
            </SidebarToggleSection>
          ))
        : group.items.map((item) => <SidebarNavItem key={item.id} item={item} />)}
      {(group.directItems ?? []).map((item) => (
        <SidebarNavItem key={item.id} item={item} />
      ))}
    </SidebarToggleSection>
  );
}
