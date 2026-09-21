import React, { useState } from 'react';
import { Container, Paper, Typography, Box, Button, Divider } from '@mui/material';
import LoginPage from './pages/LoginPage';
import PasswordRecoveryTestPage from './pages/PasswordRecoveryTestPage';
import { useAuth } from './context/AuthContext';
// 1. Se agrega la importación de tu componente
import { MessengerFleetList } from './components/MessengerFleetList';

// Esta pantalla es solo para probar T16: si hay sesión guardada (localStorage)...
function SessionActiveScreen() {
  const { user, logout } = useAuth();

  return (
    // Se ajustó el Box a flexDirection: 'column' para que los elementos se apilen
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
      
      {/* Tarjeta de sesión activa original de develop */}
      <Container maxWidth="xs" sx={{ mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Sesión activa
          </Typography>
          
          <Typography>{user.fullName}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {user.role}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
            Refresca la página (F5) - deberías seguir viendo esta pantalla sin volver a iniciar sesión. Eso es lo que prueba T16.
          </Typography>
          
          <Button variant="outlined" color="secondary" onClick={logout}>
            Cerrar sesión
          </Button>
        </Paper>
      </Container>

      {/* 2. Se inyecta todo el flujo de tu tabla (Lista -> Modal -> Hook) */}
      <Container>
        <MessengerFleetList />
      </Container>

    </Box>
  );
}

function App() {
  const { user } = useAuth();
  // 'login' | 'recovery' - navegación mínima solo para el sandbox, ya que
  // el proyecto real todavía no tiene react-router instalado.
  const [view, setView] = useState('login');

  if (user) {
    return <SessionActiveScreen />;
  }

  if (view === 'recovery') {
    return <PasswordRecoveryTestPage onBackToLogin={() => setView('login')} />;
  }

  return <LoginPage onForgotPassord={() => setView('recovery')} />;
}

export default App;