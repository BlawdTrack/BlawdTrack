import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import MenuOpenOutlinedIcon from '@mui/icons-material/MenuOpenOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import BrandLogo from '../BrandLogo';
import { FONT } from '../../theme';

/**
 * Encabezado de la barra lateral: el logo (solo la B si la barra está colapsada) en su propia fila y, debajo,
 * "Blawd Gourmet" junto al botón para colapsar o expandir la barra.
 * @param {{ collapsed?: boolean, onToggleCollapsed?: Function }} props
 */
export default function SidebarBrand({ collapsed = false, onToggleCollapsed }) {
  const toggleLabel = collapsed ? 'Expandir menú' : 'Colapsar menú';

  return (
    <Box
      sx={{
        p: collapsed ? '14px 0 10px' : '16px 14px 10px 18px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: collapsed ? 'center' : 'stretch',
        gap: 0.5,
        borderBottom: '1px solid rgba(255,255,255,.08)',
      }}
    >
      {collapsed ? <BrandLogo variant="isologo" onDark width={30} /> : <BrandLogo variant="horizontal" onDark width={150} />}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: 1 }}>
        {!collapsed && (
          <Typography
            sx={{ fontSize: FONT.xs, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,.6)' }}
          >
            Blawd Gourmet
          </Typography>
        )}
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
    </Box>
  );
}
