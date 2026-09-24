import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminManagement from './pages/AdminManagement';
import CourierRegistrationPage from './pages/CourierRegistrationPage';
import LoginPage from './pages/LoginPage';
import SalesHomePage from './pages/SalesHomePage';
import CourierHomePage from './pages/CourierHomePage';
import { MessengerFleetList } from './components/MessengerFleetList';
import { useAuth } from './hooks/useAuth';
import { getHomeRoute } from './utils/roleRoutes';

// Reemplaza el TODO anterior ("falta definir un router... temporalmente
// se renderizan ambas pantallas apiladas") con rutas reales. Cada pantalla
// vive en su propia ruta en vez de mostrarse todas a la vez.

// La ruta "/recuperar-contrasena" (PasswordRecoveryTestPage, HU-002) se
// deja fuera por ahora, aunque el código ya esté en develop: se integra en
// un cambio aparte, dedicado a HU-002, para no mezclarla con T12. Sin
// ruta, el enlace "¿Olvidaste tu contraseña?" no navega (onForgotPassword
// queda sin usar).

// T12: si ya hay sesión, "/" manda directo al inicio del rol en vez de
// pasar siempre por /login.
function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? getHomeRoute(user.role) : '/login'} replace />;
}

function LoginRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Sesión ya activa (restaurada al refrescar, o entrando directo a
  // /login): la manda a su inicio en vez de mostrarle el formulario.
  if (user) {
    return <Navigate to={getHomeRoute(user.role)} replace />;
  }

  return (
    <LoginPage
      onLoginSuccess={(response) => navigate(getHomeRoute(response.user.role), { replace: true })}
    />
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/registro-mensajero" element={<CourierRegistrationPage />} />
      <Route path="/ventas" element={<SalesHomePage />} />
      <Route path="/mensajero" element={<CourierHomePage />} />
      {/* Vista de Administradores (HU008) */}
      <Route path="/administradores" element={<AdminManagement />} />
      <Route path="/mensajeros" element={<MessengerFleetList />} />
    </Routes>
  );
}

export default App;
