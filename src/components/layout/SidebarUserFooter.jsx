import { Box, Button, Typography } from '@mui/material';
import { getInitials } from '../../utils/getInitials';

export default function SidebarUserFooter({ fullName, roleLabel, onLogout }) {
  return (
    <Box sx={{ mt: 'auto', p: '18px 20px 22px', borderTop: '1px solid rgba(255,255,255,.12)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            backgroundColor: '#FF6C0E',
            color: '#fff',
            fontSize: 12.5,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 34px',
          }}
        >
          {getInitials(fullName)}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#fff' }} noWrap>
            {fullName}
          </Typography>
          <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>{roleLabel}</Typography>
        </Box>
      </Box>
      <Button
        fullWidth
        size="small"
        variant="outlined"
        onClick={onLogout}
        sx={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}
      >
        Cerrar sesión
      </Button>
    </Box>
  );
}
