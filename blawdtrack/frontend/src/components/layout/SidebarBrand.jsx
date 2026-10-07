import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import logo from '../../assets/Logo.png';

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
          width: 38,
          height: 38,
          borderRadius: '10px',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 38px',
        }}
      >
        <img src={logo} alt="BlawdTrack" style={{ width: 22, height: 27, objectFit: 'contain' }} />
      </Box>
      {!collapsed && (
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 15.5, color: '#fff', lineHeight: 1.25, letterSpacing: '.2px' }}>
            BlawdTrack
          </Typography>
          <Typography
            sx={{ fontSize: 10, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,.6)' }}
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
            size="small"
            sx={{
              color: 'rgba(255,255,255,.75)',
              '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,.08)' },
              '&.Mui-focusVisible': { outline: '2px solid #FF6C0E' },
            }}
          >
            {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
