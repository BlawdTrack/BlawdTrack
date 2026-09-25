import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminManagement from './pages/AdminManagement';
import CourierRegistrationPage from './pages/CourierRegistrationPage';
import LoginPage from './pages/LoginPage';
import PasswordRecoveryRequestPage from './pages/PasswordRecoveryRequestPage';
import { MessengerFleetList } from './components/MessengerFleetList';

// Reemplaza el TODO anterior ("falta definir un router... temporalmente
// se renderizan ambas pantallas apiladas") con rutas reales. Cada pantalla
// vive en su propia ruta en vez de mostrarse todas a la vez.

function LoginRoute() {
  const navigate = useNavigate();

  return (
    <LoginPage
      onLoginSuccess={() => navigate('/administradores')}
      onForgotPassword={() => navigate('/recuperar-contrasena')}
    />
  );
}

function PasswordRecoveryRoute() {
  const navigate = useNavigate();

  return <PasswordRecoveryRequestPage onBackToLogin={() => navigate('/login')} />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/recuperar-contrasena" element={<PasswordRecoveryRoute />} />
      <Route path="/registro-mensajero" element={<CourierRegistrationPage />} />
      {/* Vista de Administradores (HU008) */}
      <Route path="/administradores" element={<AdminManagement />} />
      <Route path="/mensajeros" element={<MessengerFleetList />} />
    </Routes>
  );
}

export default App;
