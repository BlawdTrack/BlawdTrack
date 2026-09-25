import { Box, Chip, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS } from '../config/roles';

export default function MainMenuPage() {
  const { user } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        p: 3,
        textAlign: 'center',
      }}
    >
      <Typography sx={{ fontSize: 18, color: '#9E968D' }}>Bienvenid@ al sistema</Typography>
      <Typography
        component="h1"
        sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: { xs: 40, md: 52 }, color: '#1A3C34', letterSpacing: '-0.5px' }}
      >
        BlawdTrack
      </Typography>
      <Typography sx={{ fontSize: 17, color: '#4B4741' }}>Sistema de paquetería · {user.fullName}</Typography>
      <Chip
        label={ROLE_LABELS[user.role] ?? user.role}
        sx={{ mt: 1, bgcolor: '#FFE8D9', color: '#FF6C0E', fontWeight: 700, px: 1 }}
      />
    </Box>
  );
}
