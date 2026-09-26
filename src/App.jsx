import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminManagement from './pages/AdminManagement';
import CourierRegistrationPage from './pages/CourierRegistrationPage';
import LoginPage from './pages/LoginPage';
import SalesHomePage from './pages/SalesHomePage';
import CourierHomePage from './pages/CourierHomePage';
import PasswordRecoveryTestPage from './pages/PasswordRecoveryTestPage';
import { MessengerFleetList } from './components/MessengerFleetList';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { ROLES, getHomeRoute } from './utils/roleRoutes';

// Reemplaza el TODO anterior ("falta definir un router... temporalmente
// se renderizan ambas pantallas apiladas") con rutas reales. Cada pantalla
// vive en su propia ruta en vez de mostrarse todas a la vez.

// T12: si ya hay sesión, "/" manda directo al inicio del rol en vez de
// pasar siempre por /login.
function RootRedirect() {
  const { user } = useAuth();
  // Un rol sin inicio mapeado no debería existir (AuthContext no lo permite);
  // si pasara, se trata como sin sesión en vez de navegar a "null".
  const homeRoute = user ? getHomeRoute(user.role) : null;
  return <Navigate to={homeRoute ?? '/login'} replace />;
}

function LoginRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Sesión ya activa (restaurada al refrescar, o entrando directo a
  // /login): la manda a su inicio en vez de mostrarle el formulario.
  // Con un rol sin inicio mapeado (no debería existir) se muestra el formulario
  // en vez de navegar a "null"; ProtectedRoute ya se encarga de cerrar esa sesión.
  const homeRoute = user ? getHomeRoute(user.role) : null;
  if (homeRoute) {
    return <Navigate to={homeRoute} replace />;
  }

  return (
    <LoginPage
      onLoginSuccess={(response) => navigate(getHomeRoute(response.role), { replace: true })}
      onForgotPassword={() => navigate('/recuperar-contrasena')}
    />
  );
}

function PasswordRecoveryRoute() {
  const navigate = useNavigate();

  return <PasswordRecoveryTestPage onBackToLogin={() => navigate('/login')} />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/recuperar-contrasena" element={<PasswordRecoveryRoute />} />
      {/* T17: /login y /recuperar-contrasena son públicas. Todo lo demás exige
          sesión válida y va en el grupo del rol que puede verlo (allowedRoles):
          una pantalla nueva se agrega DENTRO del grupo que le corresponde, y si
          es para cualquier rol autenticado, en un grupo <ProtectedRoute />
          sin allowedRoles. Un rol fuera del grupo vuelve a su propio inicio.
          El inicio de cada rol (ROLE_HOME_ROUTES) debe estar en el grupo de ese
          rol, y App.routes.test.jsx se actualiza al agregar rutas. */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.SUPER_USUARIO]} />}>
        {/* Vista de Administradores (HU008) */}
        <Route path="/administradores" element={<AdminManagement />} />
        <Route path="/registro-mensajero" element={<CourierRegistrationPage />} />
        <Route path="/mensajeros" element={<MessengerFleetList />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN_VENTAS]} />}>
        <Route path="/ventas" element={<SalesHomePage />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={[ROLES.MENSAJERO]} />}>
        <Route path="/mensajero" element={<CourierHomePage />} />
      </Route>
    </Routes>
  );
}

export default App;
