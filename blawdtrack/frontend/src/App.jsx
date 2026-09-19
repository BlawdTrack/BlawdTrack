import React, { useState } from 'react';
import { Container, Paper, Typography, Box, Button, Divider } from '@mui/material';
import LoginPage from './pages/LoginPage';
import PasswordRecoveryTestPage from './pages/PasswordRecoveryTestPage';
import { useAuth } from './context/AuthContext';

// Esta pantalla es solo para probar T16: si hay sesión guardada (localStorage),
// la app arranca aquí directo en vez de mostrar el formulario de login.
// Prueba: inicia sesión, luego refresca la página (F5) — deberías seguir
// viendo esta pantalla sin volver a escribir credenciales.
function SessionActiveScreen() {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="xs">
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
            Refresca la página (F5) — deberías seguir viendo esta pantalla sin
            volver a iniciar sesión. Eso es lo que prueba T16.
          </Typography>

          <Button variant="outlined" color="secondary" onClick={logout}>
            Cerrar sesión
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

function App() {
  const { user } = useAuth();
  // 'login' | 'recovery' — navegación mínima solo para el sandbox, ya que
  // el proyecto real todavía no tiene react-router instalado.
  const [view, setView] = useState('login');

  if (user) {
    return <SessionActiveScreen />;
  }

  if (view === 'recovery') {
    return <PasswordRecoveryTestPage onBackToLogin={() => setView('login')} />;
  }

  return <LoginPage onForgotPassword={() => setView('recovery')} />;
}

export default App;
