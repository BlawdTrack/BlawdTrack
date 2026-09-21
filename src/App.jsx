import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminManagement from './pages/AdminManagement';
import CourierRegistrationPage from './pages/CourierRegistrationPage';
import LoginPage from './pages/LoginPage';

// Reemplaza el TODO anterior ("falta definir un router... temporalmente
// se renderizan ambas pantallas apiladas") con rutas reales. Cada pantalla
// vive en su propia ruta en vez de mostrarse todas a la vez.
//
// La ruta /recuperar-contrasena (HU-002) se agrega en su propia rama, junto
// con PasswordRecoveryTestPage, para que esta rama compile por sí sola.

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

