import { Box, Container, Paper, Typography, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Pantalla de inicio mínima para roles que todavía no tienen su panel real
// (T12). SalesHomePage y CourierHomePage la usan; cuando HU-010+/HU-022
// construyan la pantalla definitiva, cada una se reemplaza por la real.
export function ProvisionalHomePage({ title, description }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
          <Button variant="outlined" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default ProvisionalHomePage;
