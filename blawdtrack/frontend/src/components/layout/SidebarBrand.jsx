import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import MenuOpenOutlinedIcon from '@mui/icons-material/MenuOpenOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import BrandLogo from '../BrandLogo';
import { FONT } from '../../theme';

/**
 * Encabezado de la barra lateral con el logo, el nombre de la aplicación y el botón para colapsar o
 * expandir la barra.
 * @param {{ collapsed?: boolean, onToggleCollapsed?: Function }} props
 */
export default function SidebarBrand({ collapsed = false, onToggleCollapsed }) {
  const toggleLabel = collapsed ? 'Expandir menú' : 'Colapsar menú';

  return (
    <Box
      sx={{
        p: collapsed ? '20px 0 14px' : '24px 18px 20px 22px',
        display: 'flex',
        flexDirection: collapsed ? 'column' : 'row',
        alignItems: 'center',
        gap: 1.5,
        borderBottom: '1px solid rgba(255,255,255,.08)',
      }}
    >
      {collapsed ? (
        <BrandLogo variant="isologo" width={30} />
      ) : (
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <BrandLogo variant="horizontalCream" width={108} />
          <Typography
            sx={{ mt: 0.75, fontSize: FONT.xs, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,.6)' }}
          >
            Blawd Gourmet
          </Typography>
        </Box>
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
  );
}
