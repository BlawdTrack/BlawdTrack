import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, Chip, Typography } from '@mui/material';
import { ROUTES } from '../config/routes';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS } from '../config/roles';
import { getNavigationForRole } from '../config/navigation';
import { NAV_GROUP_ICONS } from '../components/layout/navIcons';

/** Tarjeta de un grupo del menú con sus pantallas como enlaces directos (reconocer antes que recordar). */
function QuickAccessCard({ group }) {
  const Icon = NAV_GROUP_ICONS[group.id];

  return (
    <Box
      component="section"
      aria-labelledby={`quick-${group.id}`}
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid #E4DED7',
        borderRadius: '16px',
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        {Icon && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: '#FFE8D9',
              color: 'secondary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
          </Box>
        )}
        <Typography id={`quick-${group.id}`} component="h2" sx={{ fontWeight: 600, fontSize: 15, color: 'primary.main' }}>
          {group.title}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {group.items.map((item) =>
          item.path ? (
            <Box
              key={item.id}
              component={RouterLink}
              to={item.path}
              sx={{
                minHeight: 44,
                px: 1.5,
                display: 'flex',
                alignItems: 'center',
                borderRadius: '8px',
                color: 'text.primary',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                '&:hover': { bgcolor: '#F1ECE7' },
                '&:focus-visible': { outline: '2px solid #FF6C0E', outlineOffset: 1 },
              }}
            >
              {item.label}
            </Box>
          ) : (
            <Box
              key={item.id}
              sx={{ minHeight: 44, px: 1.5, display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: 14 }}
            >
              {item.label} · próximamente
            </Box>
          )
        )}
      </Box>
    </Box>
  );
}

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
    <Box sx={{ maxWidth: 1040, mx: 'auto', p: { xs: 2.5, md: 5 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: '16px',
          borderLeft: '6px solid',
          borderColor: 'secondary.main',
          p: { xs: 3, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 1,
        }}
      >
        <Typography sx={{ fontSize: 15, color: 'rgba(255,255,255,0.75)' }}>Bienvenid@ al sistema</Typography>
        <Typography
          component="h1"
          sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: { xs: 34, md: 44 }, letterSpacing: '-0.5px' }}
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
          <Typography id="quick-access-title" variant="h6" component="h2" sx={{ mb: 2, color: 'primary.main' }}>
            ¿Qué quieres hacer hoy?
          </Typography>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {groups.map((group) => (
              <QuickAccessCard key={group.id} group={group} />
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
    </Box>
  );
}
