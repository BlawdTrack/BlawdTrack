import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Collapse, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SidebarNavItem from './SidebarNavItem';

/**
 * Un grupo del menú. Con la barra expandida su título abre y cierra la lista de ítems (arranca cerrado
 * y, si la pantalla actual es del grupo, lo marca con un punto naranja); con la barra colapsada solo se
 * ven los iconos, separados del grupo anterior por una línea.
 * @param {{ group: { id: string, title: string, items: Array }, collapsed?: boolean,
 *   showDivider?: boolean }} props
 */
export default function SidebarNavGroup({ group, collapsed = false, showDivider = false }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const hasActiveItem = group.items.some((item) => item.path === pathname);
  const listId = `sidebar-group-${group.id}`;

  if (collapsed) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {showDivider && <Divider sx={{ borderColor: 'rgba(255,255,255,.1)', my: 1 }} />}
        {group.items.map((item) => (
          <SidebarNavItem key={item.id} item={item} collapsed />
        ))}
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
          minHeight: 36,
          px: 1.5,
          border: 0,
          borderRadius: '8px',
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: hasActiveItem ? '#fff' : 'rgba(255,255,255,.6)',
          '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,.05)' },
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
