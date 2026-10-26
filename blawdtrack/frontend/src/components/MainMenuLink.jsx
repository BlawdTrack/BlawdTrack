import { useContext } from 'react';
import { Link as RouterLink, useInRouterContext, useLocation } from 'react-router-dom';
import { Button } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { isModuleScreen } from '../config/navigation';
import { AuthContext } from '../context/authContextInstance';
import { ROUTES } from '../config/routes';
import { getHomeRoute } from '../utils/roleRoutes';
import { FONT, TOUCH_TARGET } from '../theme';

function Link() {
  const { pathname } = useLocation();
  // Sin sesión en el contexto (pantallas aisladas) se usa el menú principal; cada rol vuelve a su propio inicio.
  const user = useContext(AuthContext)?.user;

  // Solo dentro de los módulos: el menú principal y las pantallas sueltas no tienen a dónde "volver".
  if (!isModuleScreen(pathname)) return null;

  return (
    <Button
      component={RouterLink}
      to={(user && getHomeRoute(user.role)) || ROUTES.MAIN_MENU}
      data-testid="main-menu-link"
      startIcon={<HomeOutlinedIcon />}
      sx={{
        flex: '0 0 auto',
        minHeight: TOUCH_TARGET,
        px: 1.5,
        color: 'primary.main',
        fontSize: FONT.md,
        fontWeight: 700,
        textTransform: 'none',
        '&:hover': { bgcolor: 'neutral.surface' },
      }}
    >
      Menú principal
    </Button>
  );
}

/**
 * Enlace con icono de casa y el texto "Menú principal" para volver al menú principal desde cualquier pantalla de
 * un módulo. No muestra nada fuera de los módulos ni si no hay un router (como en pruebas aisladas).
 */
export default function MainMenuLink() {
  return useInRouterContext() ? <Link /> : null;
}
