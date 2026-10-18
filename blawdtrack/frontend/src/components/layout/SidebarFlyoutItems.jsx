import { NavLink } from 'react-router-dom';
import { ListItemIcon, MenuItem, MenuList, Paper, Popper, Typography, Box, ClickAwayListener } from '@mui/material';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import { NAV_GROUP_ICONS, NAV_ITEM_ICONS } from './navIcons';
import { useFlyoutHover } from '../../hooks/useFlyoutHover';
import { RADIUS, FONT, rem } from '../../theme';

const PANEL_SX = { minWidth: rem(176), borderRadius: RADIUS.sm, border: '1px solid', borderColor: 'neutral.border', py: 0.5 };

/**
 * Una pantalla dentro de un menú flotante de la barra colapsada: enlace con su icono, deshabilitada con el aviso
 * "próximamente" si todavía no tiene ruta.
 * @param {{ item: { id: string, label: string, path: string|null }, active: boolean, onClick: Function }} props
 */
export function FlyoutMenuItem({ item, active, onClick }) {
  const ItemIcon = NAV_ITEM_ICONS[item.id];

  return (
    <MenuItem
      {...(item.path ? { component: NavLink, to: item.path, end: true } : {})}
      disabled={!item.path}
      selected={active}
      onClick={onClick}
      sx={{ minHeight: 44, fontSize: FONT.sm, fontWeight: active ? 600 : 500 }}
    >
      {ItemIcon && (
        <ListItemIcon sx={{ minWidth: rem(28), color: active ? 'secondary.main' : 'text.secondary' }}>
          <ItemIcon fontSize="small" />
        </ListItemIcon>
      )}
      {item.path ? item.label : `${item.label} · próximamente`}
    </MenuItem>
  );
}

/**
 * Lista del menú flotante de un grupo con submenús (Gestión de usuarios): una fila por submenú (Mensajeros,
 * Administradores), las funciones propias del grupo (Roles y permisos) a continuación y, al pasar el cursor por una
 * fila de submenú, un segundo cuadro a su derecha con sus funciones. Reutiliza el
 * "triángulo seguro" del menú de primer nivel (`useFlyoutHover`), así el cursor puede ir en diagonal de una fila a
 * su cuadro sin que se abra la fila vecina. El segundo cuadro cuelga del primero en el árbol de React, así que
 * moverse hacia él no cuenta como salir del primero.
 * @param {{ submenus: Array, pathname: string, onClose: Function, menuId: string, autoFocusItem?: boolean,
 *   onKeyDown?: Function }} props
 */
export default function SidebarSubmenuFlyout({
  submenus,
  directItems = [],
  pathname,
  onClose,
  menuId,
  autoFocusItem = false,
  onKeyDown,
}) {
  const sub = useFlyoutHover();

  return (
    <>
      <MenuList id={menuId} autoFocusItem={autoFocusItem} onKeyDown={onKeyDown}>
        {submenus.map((submenu) => {
          const Icon = NAV_GROUP_ICONS[submenu.id];
          const active = submenu.items.some((item) => item.path === pathname);
          const open = sub.openId === submenu.id;
          return (
            <MenuItem
              key={submenu.id}
              selected={active || open}
              aria-haspopup="menu"
              aria-expanded={open}
              onMouseEnter={(event) => sub.onTriggerEnter(submenu.id, event)}
              onMouseLeave={() => sub.onTriggerLeave(submenu.id)}
              onClick={(event) => sub.onTriggerClick(submenu.id, event)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight') sub.onTriggerClick(submenu.id, { currentTarget: event.currentTarget, detail: 0 });
              }}
              sx={{ minHeight: 44, fontSize: FONT.sm, fontWeight: active ? 600 : 500, justifyContent: 'space-between', gap: 1 }}
            >
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                {Icon && (
                  <ListItemIcon sx={{ minWidth: rem(28), color: active ? 'secondary.main' : 'text.secondary' }}>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                )}
                {submenu.title}
              </Box>
              <ChevronRightOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </MenuItem>
          );
        })}
        {directItems.map((item) => (
          <FlyoutMenuItem key={item.id} item={item} active={item.path === pathname} onClick={onClose} />
        ))}
      </MenuList>

      {submenus.map((submenu) => (
        <Popper
          key={submenu.id}
          open={sub.openId === submenu.id}
          anchorEl={sub.anchorEl}
          placement="right-start"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 3 }}
        >
          {/* El relleno izquierdo une la fila con su cuadro, para que el cursor no "salga" al cruzar. */}
          <Box ref={sub.registerPanel} onMouseEnter={sub.onPanelEnter} onMouseLeave={sub.onPanelLeave} sx={{ pl: 1 }}>
            <ClickAwayListener onClickAway={(event) => !sub.anchorEl?.contains(event.target) && sub.close()}>
              <Paper elevation={8} sx={PANEL_SX}>
                <Typography
                  sx={{ px: 2, py: 0.75, fontSize: FONT.xs, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'text.secondary' }}
                >
                  {submenu.title}
                </Typography>
                <MenuList
                  autoFocusItem={sub.focusFirst}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowLeft') {
                      sub.anchorEl?.focus();
                      sub.close();
                    }
                  }}
                >
                  {submenu.items.map((item) => (
                    <FlyoutMenuItem key={item.id} item={item} active={item.path === pathname} onClick={onClose} />
                  ))}
                </MenuList>
              </Paper>
            </ClickAwayListener>
          </Box>
        </Popper>
      ))}
    </>
  );
}
