import { useNavigate } from 'react-router-dom';
import { Box, Button, Chip, Typography } from '@mui/material';
import { ROUTES } from '../config/routes';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS } from '../config/roles';
import { getNavigationForRole } from '../config/navigation';
import { NAV_GROUP_ICONS } from '../components/layout/navIcons';
import MenuCard from '../components/MenuCard';
import PageContainer from '../components/PageContainer';
import { getGreeting } from '../utils/greeting';

/**
 * Inicio del Super Usuario dentro del menú principal: saludo con su nombre y su rol, accesos rápidos a
 * las pantallas que su rol puede usar y, en móvil, cerrar sesión.
 */
export default function MainMenuPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const groups = getNavigationForRole(user.role);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <PageContainer>
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: '16px',
          borderLeft: '6px solid',
          borderColor: 'secondary.main',
          p: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 1,
        }}
      >
        <Typography sx={{ fontSize: 16, color: 'rgba(255,255,255,0.75)' }}>Bienvenid@ al sistema</Typography>
        <Typography
          component="h1"
          sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: { xs: 28, md: 36 }, letterSpacing: '-0.5px' }}
        >
          BlawdTrack
        </Typography>
        <Typography sx={{ fontSize: 16, color: 'rgba(255,255,255,0.85)' }}>Sistema de paquetería · {user.fullName}</Typography>
        <Chip
          label={ROLE_LABELS[user.role] ?? user.role}
          sx={{ mt: 1, bgcolor: '#FFE8D9', color: '#B84700', fontWeight: 700, px: 1 }}
        />
      </Box>

      {groups.length > 0 && (
        <Box component="section" aria-labelledby="quick-access-title">
          <Typography id="quick-access-title" variant="h5" component="h2" sx={{ color: 'primary.main' }}>
            {getGreeting()}
          </Typography>
          <Typography sx={{ fontSize: 16, color: 'text.secondary', mt: 0.5, mb: 2.5 }}>
            ¿Qué deseas hacer hoy?
          </Typography>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {groups.map((group) => (
              <MenuCard
                key={group.id}
                to={group.path}
                icon={NAV_GROUP_ICONS[group.id]}
                title={group.title}
                description={group.description}
              />
            ))}
          </Box>
        </Box>
      )}

      <Button
        onClick={handleLogout}
        sx={{ display: { xs: 'inline-flex', md: 'none' }, alignSelf: 'center', color: 'primary.main', minHeight: 48 }}
      >
        Cerrar sesión
      </Button>
    </PageContainer>
  );
}
