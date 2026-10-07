import { Box, Typography } from '@mui/material';
import logo from '../../assets/Logo.png';

/** Encabezado de la barra lateral con el logo y el nombre de la aplicación. */
export default function SidebarBrand() {
  return (
    <Box
      sx={{
        p: '24px 22px 20px',
        display: 'flex',
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
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 15.5, color: '#fff', lineHeight: 1.25, letterSpacing: '.2px' }}>
          BlawdTrack
        </Typography>
        <Typography
          sx={{ fontSize: 10, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,.6)' }}
        >
          Blawd Gourmet
        </Typography>
      </Box>
    </Box>
  );
}
