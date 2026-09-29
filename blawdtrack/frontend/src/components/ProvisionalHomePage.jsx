import { Box, Container, Paper, Typography, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getPasswordResetRoute } from '../utils/roleRoutes';

// Pantalla de inicio mínima para roles que todavía no tienen su panel real
// (T12). SalesHomePage y CourierHomePage la usan; cuando HU-010+/HU-022
// construyan la pantalla definitiva, cada una se reemplaza por la real.
/**
 * @param {{ title: string, description: string }} props Título y texto de la pantalla provisional;
 *   muestra el usuario y el rol autenticados y un botón para cerrar sesión.
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
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', border: '1px solid #E4DED7' }}>
          <Chip label="Pantalla provisional" size="small" sx={{ mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {title}
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>{description}</Typography>
          <Typography sx={{ mb: 0.5 }}>
            <strong>Usuario:</strong> {user?.fullName}
          </Typography>
          <Typography sx={{ mb: 3 }}>
            <strong>Rol:</strong> {user?.role}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {passwordResetRoute && (
              <Button variant="contained" onClick={() => navigate(passwordResetRoute)}>
                Restablecer contraseña
              </Button>
            )}
            <Button variant="outlined" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default ProvisionalHomePage;
