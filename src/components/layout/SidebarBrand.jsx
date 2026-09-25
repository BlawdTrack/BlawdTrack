import { Box, Typography } from '@mui/material';
import logo from '../../assets/Logo.png';

export default function SidebarBrand() {
  return (
    <Box sx={{ p: '22px 22px 18px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '11px',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,.2)',
        }}
      >
        <img src={logo} alt="BlawdTrack" style={{ width: 24, height: 29, objectFit: 'contain' }} />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: 17, color: '#fff', lineHeight: 1.2 }}>BlawdTrack</Typography>
        <Typography
          sx={{ fontSize: 10.5, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}
        >
          Blawd Gourmet
        </Typography>
      </Box>
    </Box>
  );
}
