import { Box, Button, Chip, Typography } from '@mui/material';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS } from '../config/roles';
import { getPasswordResetRoute } from '../utils/roleRoutes';
import logo from '../assets/Logo.png';

const CARD_SX = {
  bgcolor: 'background.paper',
  border: '1px solid #E4DED7',
  borderRadius: '16px',
  p: { xs: 2.5, sm: 3 },
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
};

// Pantalla de inicio mínima para roles que todavía no tienen su panel real
// (T12). SalesHomePage y CourierHomePage la usan; cuando HU-010+/HU-022
// construyan la pantalla definitiva, cada una se reemplaza por la real.
/**
 * @param {{ title: string, description: string }} props Título y texto de la pantalla provisional;
 *   muestra el usuario y el rol autenticados, el acceso a restablecer la contraseña y cerrar sesión.
 */
export function ProvisionalHomePage({ title, description }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Cada rol restablece su propia contraseña desde su inicio.
  const passwordResetRoute = getPasswordResetRoute(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="header"
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderBottom: '4px solid',
          borderColor: 'secondary.main',
          px: { xs: 2, sm: 4 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src={logo} alt="BlawdTrack" style={{ width: 22, height: 27, objectFit: 'contain' }} />
          </Box>
          <Typography variant="h6" component="span">
            BlawdTrack
          </Typography>
        </Box>
        <Button
          onClick={handleLogout}
          startIcon={<LogoutIcon fontSize="small" />}
          sx={{
            color: 'rgba(255,255,255,.9)',
            minHeight: 44,
            border: '1px solid rgba(255,255,255,.25)',
            '&:hover': { bgcolor: 'rgba(255,255,255,.08)' },
          }}
        >
          Cerrar sesión
        </Button>
      </Box>

      <Box
        component="main"
        sx={{ maxWidth: 880, mx: 'auto', p: { xs: 2.5, md: 5 }, display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <Box sx={{ pl: 2, borderLeft: '4px solid', borderColor: 'secondary.main' }}>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Bienvenid@, {user?.fullName}</Typography>
          <Typography variant="h5" component="h1" sx={{ color: 'primary.main' }}>
            {title}
          </Typography>
          <Chip
            label={ROLE_LABELS[user?.role] ?? user?.role}
            size="small"
            sx={{ mt: 1, bgcolor: '#FFE8D9', color: '#B84700', fontWeight: 700 }}
          />
        </Box>

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' } }}>
          <Box component="section" sx={CARD_SX}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <ConstructionOutlinedIcon sx={{ color: 'secondary.main' }} />
              <Typography component="h2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Estamos preparando tu panel
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 14, color: 'text.secondary', lineHeight: 1.6 }}>{description}</Typography>
          </Box>

          {passwordResetRoute && (
            <Box component="section" sx={CARD_SX}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <LockResetOutlinedIcon sx={{ color: 'secondary.main' }} />
                <Typography component="h2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Tu cuenta
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                Cambia tu contraseña cuando lo necesites. Te enviaremos un enlace a tu correo.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate(passwordResetRoute)}
                sx={{ alignSelf: 'flex-start', minHeight: 48, px: 3 }}
              >
                Restablecer contraseña
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default ProvisionalHomePage;
