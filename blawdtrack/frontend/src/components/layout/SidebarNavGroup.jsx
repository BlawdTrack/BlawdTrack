import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Box,
  ClickAwayListener,
  Collapse,
  ListItemIcon,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SidebarNavItem from './SidebarNavItem';
import { NAV_GROUP_ICONS, NAV_ITEM_ICONS } from './navIcons';
import { RADIUS } from '../../theme';

/**
 * Un grupo del menú. Con la barra expandida su título abre y cierra la lista de ítems (arranca cerrado
 * y, si la pantalla actual es del grupo, lo marca con un punto naranja). Con la barra colapsada el grupo
 * es un solo icono que despliega la lista de sus pantallas en un menú flotante al pasar el cursor.
 * @param {{ group: { id: string, title: string, items: Array }, collapsed?: boolean,
 *   flyout?: ReturnType<typeof import('../../hooks/useFlyoutHover').useFlyoutHover> }} props `flyout`
 *   es el controlador compartido de los menús flotantes (obligatorio con la barra colapsada).
 */
export default function SidebarNavGroup({ group, collapsed = false, flyout }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const hasActiveItem = pathname === group.path || group.items.some((item) => item.path === pathname);
  const listId = `sidebar-group-${group.id}`;

  if (collapsed) {
    const GroupIcon = NAV_GROUP_ICONS[group.id];
    const menuId = `${listId}-menu`;
    const { openId, anchorEl, focusFirst, registerPanel, close, onPanelEnter, onPanelLeave } = flyout;
    const menuOpen = openId === group.id;

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
            width: 48,
            height: 48,
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
          {GroupIcon && <GroupIcon sx={{ fontSize: 22 }} />}
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
              <Paper elevation={8} sx={{ minWidth: 220, borderRadius: RADIUS.sm, border: '1px solid', borderColor: 'neutral.border', py: 0.5 }}>
                <Typography
                  sx={{ px: 2, py: 0.75, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'text.secondary' }}
                >
                  {group.title}
                </Typography>
                <MenuList
                  id={menuId}
                  autoFocusItem={focusFirst}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape' || event.key === 'Tab') {
                      if (event.key === 'Escape') anchorEl?.focus();
                      close();
                    }
                  }}
                >
                  {group.items.map((item) => {
                    const ItemIcon = NAV_ITEM_ICONS[item.id];
                    const active = item.path === pathname;
                    return (
                      <MenuItem
                        key={item.id}
                        {...(item.path ? { component: NavLink, to: item.path, end: true } : {})}
                        disabled={!item.path}
                        selected={active}
                        onClick={close}
                        sx={{ minHeight: 44, fontSize: 14, fontWeight: active ? 600 : 500 }}
                      >
                        {ItemIcon && (
                          <ListItemIcon sx={{ minWidth: 34, color: active ? 'secondary.main' : 'text.secondary' }}>
                            <ItemIcon fontSize="small" />
                          </ListItemIcon>
                        )}
                        {item.path ? item.label : `${item.label} · próximamente`}
                      </MenuItem>
                    );
                  })}
                </MenuList>
              </Paper>
            </ClickAwayListener>
          </Box>
        </Popper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <Box
        component="button"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={listId}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          minHeight: 44,
          px: 1.5,
          border: 0,
          borderRadius: RADIUS.sm,
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: hasActiveItem ? 'common.white' : 'rgba(255,255,255,.6)',
          '&:hover': { color: 'common.white', backgroundColor: 'rgba(255,255,255,.05)' },
          '&:focus-visible': { outline: '2px solid #FF6C0E', outlineOffset: 1 },
        }}
      >
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {group.title}
          {hasActiveItem && (
            <Box
              component="span"
              aria-hidden="true"
              sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'secondary.main' }}
            />
          )}
        </Box>
        <ExpandMoreIcon
          sx={{ fontSize: 18, transition: 'transform .2s ease', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        />
      </Box>
      <Collapse in={open} id={listId}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {group.items.map((item) => (
            <SidebarNavItem key={item.id} item={item} />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
