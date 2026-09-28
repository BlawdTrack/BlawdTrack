import { Box, Button, Typography } from '@mui/material';
export default function SidebarUserFooter({ fullName, email = '', roleLabel, onLogout }) {
  return (
    <Box sx={{ mt: 'auto', p: '16px 18px 18px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          p: '10px 12px',
          mb: 1.25,
          borderRadius: '10px',
          backgroundColor: 'rgba(255,255,255,.05)',
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#FF6C0E',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 32px',
          }}
        >
          {email.charAt(0).toUpperCase()}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#fff' }} noWrap>
            {fullName}
          </Typography>
          <Typography sx={{ fontSize: 10.5, color: 'rgba(255,255,255,.45)' }} noWrap>
            {roleLabel}
          </Typography>
        </Box>
      </Box>
      <Button
        fullWidth
        size="small"
        onClick={onLogout}
        sx={{
          color: 'rgba(255,255,255,.75)',
          fontSize: 12.5,
          fontWeight: 600,
          textTransform: 'none',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,.14)',
          py: '8px',
          '&:hover': { backgroundColor: 'rgba(255,255,255,.06)', borderColor: 'rgba(255,255,255,.14)' },
        }}
      >
        Cerrar sesión
      </Button>
    </Box>
  );
}
