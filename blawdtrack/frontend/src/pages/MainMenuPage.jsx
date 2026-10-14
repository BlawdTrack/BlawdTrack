import { useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { ROUTES } from '../config/routes';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS } from '../config/roles';
import { getMainMenuColumns } from '../config/mainMenu';
import MainMenuSection from '../components/MainMenuSection';
import PageContainer from '../components/PageContainer';
import WelcomeBanner from '../components/WelcomeBanner';
import { getGreeting } from '../utils/greeting';
import { rem, TOUCH_TARGET } from '../theme';

/**
 * Inicio del Super Usuario y del Administrador de Ventas dentro del menú principal: banner de bienvenida con su
 * rol, el saludo según la hora y la pregunta de qué desea hacer, y debajo los módulos del rol repartidos en
 * secciones y dos columnas (los que aún no existen salen como "Próximamente"). Todo va centrado y repartido en la
 * altura de la pantalla; en móvil se agrega el botón de cerrar sesión.
 */
export default function MainMenuPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const columns = getMainMenuColumns(user.role);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <PageContainer
      sx={{
        // Banner y módulos ocupan casi todo el ancho disponible para no dejar espacio muerto a los lados.
        maxWidth: rem(1500),
        minHeight: { xs: 'calc(100vh - 72px)', md: '100vh' },
        justifyContent: 'center',
        gap: { xs: 4, md: 6 },
      }}
    >
      <WelcomeBanner roleLabel={ROLE_LABELS[user.role] ?? user.role} greeting={getGreeting()} question="¿Qué deseas hacer hoy?" />

      {columns.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            alignItems: 'start',
            gap: { xs: 4, md: 4 },
            gridTemplateColumns: { xs: '1fr', md: `repeat(${columns.length}, minmax(0, 1fr))` },
          }}
        >
          {columns.map((sections) => (
            <Box key={sections[0].id} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {sections.map((section) => (
                <MainMenuSection key={section.id} section={section} />
              ))}
            </Box>
          ))}
        </Box>
      )}

      <Button
        onClick={handleLogout}
        sx={{ display: { xs: 'inline-flex', md: 'none' }, alignSelf: 'center', color: 'primary.main', minHeight: TOUCH_TARGET }}
      >
        Cerrar sesión
      </Button>
    </PageContainer>
  );
}
