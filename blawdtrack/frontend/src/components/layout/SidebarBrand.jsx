import { Box, IconButton, Tooltip } from '@mui/material';
import MenuOpenOutlinedIcon from '@mui/icons-material/MenuOpenOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import BrandLogo from '../BrandLogo';

/**
 * Encabezado de la barra lateral: el logo (solo la B si la barra está colapsada) y, junto a él, el botón para
 * colapsar o expandir la barra. Colapsada, el botón queda debajo de la B porque no cabe al lado.
 * @param {{ collapsed?: boolean, onToggleCollapsed?: Function }} props
 */
export default function SidebarBrand({ collapsed = false, onToggleCollapsed }) {
  const toggleLabel = collapsed ? 'Expandir menú' : 'Colapsar menú';

  return (
    <Box
      sx={{
        p: collapsed ? '14px 0 10px' : '12px 8px 12px 12px',
        display: 'flex',
        flexDirection: collapsed ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 0.5,
        borderBottom: '1px solid rgba(255,255,255,.08)',
      }}
    >
      {collapsed ? <BrandLogo variant="isologo" onDark width={30} /> : <BrandLogo variant="horizontalShort" onDark width={118} />}
      {onToggleCollapsed && (
        <Tooltip title={toggleLabel} placement="right" arrow>
          <IconButton
            onClick={onToggleCollapsed}
            aria-label={toggleLabel}
            sx={{
              width: 44,
              height: 44,
              color: 'rgba(255,255,255,.75)',
              '&:hover': { color: 'common.white', backgroundColor: 'rgba(255,255,255,.08)' },
              '&.Mui-focusVisible': { outline: '2px solid #FF6C0E' },
            }}
          >
            {collapsed ? <MenuOutlinedIcon /> : <MenuOpenOutlinedIcon />}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
