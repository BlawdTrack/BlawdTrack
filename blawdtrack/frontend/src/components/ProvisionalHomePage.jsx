import { Box, Button, Chip, Typography } from '@mui/material';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS } from '../config/roles';
import { getPasswordResetRoute } from '../utils/roleRoutes';
import AppHeaderBar from './AppHeaderBar';
import PageContainer from './PageContainer';
import { CARD_PATTERN_SX, RADIUS, FONT, TOUCH_TARGET } from '../theme';

const CARD_SX = {
  ...CARD_PATTERN_SX,
  border: '1px solid', borderColor: 'neutral.border',
  borderRadius: RADIUS.md,
  p: { xs: 2.5, sm: 3 },
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
};

// Pantalla de inicio mínima para roles que todavía no tienen su panel real
// (T12). SalesHomePage y CourierHomePage la usan; cuando HU-010+/HU-022
// construyan la pantalla definitiva, cada una se reemplaza por la real.
/**
 * @param {{ title: string, description: string, children?: import('react').ReactNode }} props Título y
 *   texto de la pantalla provisional; muestra el usuario y el rol autenticados, el acceso a restablecer
 *   la contraseña y cerrar sesión. `children` permite añadir accesos propios del rol (por ejemplo, un
 *   botón hacia una pantalla nueva) sin rehacer la pantalla provisional.
 */
export function ProvisionalHomePage({ title, description, children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Cada rol restablece su propia contraseña desde su inicio.
  const passwordResetRoute = getPasswordResetRoute(user?.role);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppHeaderBar />

      <PageContainer component="main">
        <Box sx={{ pl: 2, borderLeft: '4px solid', borderColor: 'secondary.main' }}>
          <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>Bienvenid@, {user?.fullName}</Typography>
          <Typography variant="h5" component="h1" sx={{ color: 'primary.main' }}>
            {title}
          </Typography>
          <Chip
            label={ROLE_LABELS[user?.role] ?? user?.role}
            size="small"
            sx={{ mt: 1, bgcolor: 'secondary.light', color: 'secondary.text', fontWeight: 700 }}
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
            <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary', lineHeight: 1.6 }}>{description}</Typography>
          </Box>

          {passwordResetRoute && (
            <Box component="section" sx={CARD_SX}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <LockResetOutlinedIcon sx={{ color: 'secondary.main' }} />
                <Typography component="h2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Tu cuenta
                </Typography>
              </Box>
              <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>
                Cambia tu contraseña cuando lo necesites. Te enviaremos un enlace a tu correo.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate(passwordResetRoute)}
                sx={{ alignSelf: 'flex-start', minHeight: TOUCH_TARGET, px: 3 }}
              >
                Restablecer contraseña
              </Button>
            </Box>
          )}
        </Box>

        {children}
      </PageContainer>
    </Box>
  );
}

export default ProvisionalHomePage;
