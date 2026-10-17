import { Box, Button } from '@mui/material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../config/routes';
import BrandLogo from './BrandLogo';
import { TOUCH_TARGET } from '../theme';

// Sobre el encabezado verde los botones son transparentes con un contorno claro
// (el tema da fondo blanco a los botones de texto). Vive aquí una sola vez.
const ACTION_SX = {
  color: 'rgba(255,255,255,.9)',
  minHeight: TOUCH_TARGET,
  border: '1px solid rgba(255,255,255,.25)',
  bgcolor: 'transparent',
  '&:hover': { bgcolor: 'rgba(255,255,255,.08)' },
};

/**
 * Encabezado verde superior compartido por las pantallas que no van dentro del
 * menú principal (inicios provisionales de los roles y consulta de paquetes):
 * el logo de la marca a la izquierda y, a la derecha, un botón "Volver" opcional
 * y "Cerrar sesión". Cerrar sesión limpia la sesión y vuelve al login.
 *
 * @param {{ backTo?: string|null }} props `backTo` es la ruta del botón "Volver";
 *   si no se indica (o es nulo), el botón no se muestra (por ejemplo, en el
 *   inicio de un rol, que no tiene a dónde volver).
 */
export default function AppHeaderBar({ backTo = null }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
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
        flexWrap: 'wrap',
      }}
    >
      <BrandLogo variant="horizontal" onDark width={108} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        {backTo && (
          <Button
            onClick={() => navigate(backTo)}
            startIcon={<ArrowBackOutlinedIcon fontSize="small" />}
            sx={ACTION_SX}
          >
            Volver
          </Button>
        )}
        <Button onClick={handleLogout} startIcon={<LogoutOutlinedIcon fontSize="small" />} sx={ACTION_SX}>
          Cerrar sesión
        </Button>
      </Box>
    </Box>
  );
}
