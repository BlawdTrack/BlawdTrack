import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import MenuOpenOutlinedIcon from '@mui/icons-material/MenuOpenOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import logo from '../../assets/Logo.png';
import { RADIUS, FONT } from '../../theme';

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
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: RADIUS.sm,
          backgroundColor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 30px',
        }}
      >
        <img src={logo} alt="BlawdTrack" style={{ width: 18, height: 22, objectFit: 'contain' }} />
      </Box>
      {!collapsed && (
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: FONT.md, color: 'common.white', lineHeight: 1.25, letterSpacing: '.2px' }}>
            BlawdTrack
          </Typography>
          <Typography
            sx={{ fontSize: FONT.xs, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,.6)' }}
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
