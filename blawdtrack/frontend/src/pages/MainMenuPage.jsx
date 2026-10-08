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
import { RADIUS } from '../theme';

/**
 * Inicio del Super Usuario dentro del menú principal: portada con su rol (en la etiqueta), el saludo según la
 * hora y una fila por módulo que su rol puede usar. Todo va centrado y repartido en la altura de la
 * pantalla; en móvil se agrega el botón de cerrar sesión.
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
    <PageContainer
      sx={{
        minHeight: { xs: 'calc(100vh - 84px)', md: '100vh' },
        justifyContent: 'center',
        gap: { xs: 4, md: 6 },
      }}
    >
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: RADIUS.lg,
          // Franja naranja recta en el borde superior (con borderTop se curvaba en las esquinas).
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            bgcolor: 'secondary.main',
          },
          px: { xs: 3, md: 6 },
          // La franja naranja ocupa los 6 px de arriba, así que el relleno superior es un poco mayor.
          pt: 2.75,
          pb: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 1,
        }}
      >
        <Typography
          component="h1"
          sx={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 700,
            fontSize: { xs: 36, md: 56 },
            lineHeight: 1.1,
            letterSpacing: '-0.5px',
          }}
        >
          BlawdTrack
        </Typography>
        <Typography sx={{ fontSize: { xs: 16, md: 18 }, color: 'rgba(255,255,255,0.9)' }}>
          Sistema de paquetería
        </Typography>
        <Chip
          label={ROLE_LABELS[user.role] ?? user.role}
          sx={{ mt: 0.5, bgcolor: 'secondary.light', color: 'secondary.text', fontWeight: 700, fontSize: 14, height: 32, px: 1 }}
        />
      </Box>

      {groups.length > 0 && (
        <Box component="section" aria-labelledby="quick-access-title" sx={{ textAlign: 'center' }}>
          <Typography
            id="quick-access-title"
            variant="h4"
            component="h2"
            sx={{ color: 'primary.main', fontSize: { xs: 28, md: 32 } }}
          >
            {getGreeting()}
          </Typography>
          <Typography sx={{ fontSize: 18, color: 'text.secondary', mt: 0.5, mb: { xs: 3, md: 4 } }}>
            ¿Qué deseas hacer hoy?
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: '1fr',
            }}
          >
            {groups.map((group) => (
              <MenuCard
                key={group.id}
                to={group.path}
                icon={NAV_GROUP_ICONS[group.id]}
                title={group.title}
                description={group.description}
                variant="row"
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
