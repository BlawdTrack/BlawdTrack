import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminManagement from './pages/AdminManagement';
import CourierRegistrationPage from './pages/CourierRegistrationPage';
import LoginPage from './pages/LoginPage';

// Reemplaza el TODO anterior ("falta definir un router... temporalmente
// se renderizan ambas pantallas apiladas") con rutas reales. Cada pantalla
// vive en su propia ruta en vez de mostrarse todas a la vez.

// La ruta "/recuperar-contrasena" (PasswordRecoveryTestPage, HU-002) se
// quita mientras esta rama no incluya la HU-002: esa pantalla vive en
// feature/HU002/restablecimiento-Alvaro y todavía no está en develop.
// Vuelve a agregarse cuando se integre esa rama. Sin ruta, el enlace
// "¿Olvidaste tu contraseña?" no navega (onForgotPassword queda sin usar).
function LoginRoute() {
  const navigate = useNavigate();

  return <LoginPage onLoginSuccess={() => navigate('/administradores')} />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/registro-mensajero" element={<CourierRegistrationPage />} />
      {/* Vista de Administradores (HU008) */}
      <Route path="/administradores" element={<AdminManagement />} />
    </Routes>
  );
}

export default App;
