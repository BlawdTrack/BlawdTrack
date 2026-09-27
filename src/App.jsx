import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminManagement from './pages/AdminManagement';
import CourierRegistrationPage from './pages/CourierRegistrationPage';
import LoginPage from './pages/LoginPage';
import MainMenuPage from './pages/MainMenuPage';
import PasswordRecoveryTestPage from './pages/PasswordRecoveryTestPage';
import RoleAccessManagement from './pages/RoleAccessManagement';
import { MessengerFleetList } from './components/MessengerFleetList';
import MainMenuLayout from './components/layout/MainMenuLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './config/roles';
import { ROUTES } from './config/routes';

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
      onLoginSuccess={() => navigate(ROUTES.MAIN_MENU)}
      onForgotPassword={() => navigate(ROUTES.PASSWORD_RECOVERY)}
    />
  );
}

function PasswordRecoveryRoute() {
  const navigate = useNavigate();

  return <PasswordRecoveryTestPage onBackToLogin={() => navigate(ROUTES.LOGIN)} />;
}

function App() {
  return (
    <Routes>
<Route path="/" element={<RootRedirect />} />
      <Route path={ROUTES.LOGIN} element={<LoginRoute />} />
      <Route path={ROUTES.PASSWORD_RECOVERY} element={<PasswordRecoveryRoute />} />

      {/* Las rutas administrativas requieren una sesión de Super Usuario. */}
      {/* NOTA: Verifica en tu archivo roles.js si se llama SUPER_USER o SUPER_USUARIO */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.SUPER_USER]} />}>
        {/* Mantenemos el MainMenuLayout de develop para que tu pantalla tenga menú */}
        <Route element={<MainMenuLayout />}>
          <Route path={ROUTES.MAIN_MENU} element={<MainMenuPage />} />
          <Route path={ROUTES.COURIER_CREATE} element={<CourierRegistrationPage />} />
          <Route path={ROUTES.COURIER_DEACTIVATE} element={<MessengerFleetList />} />
          <Route path={ROUTES.ADMIN_DELETE} element={<AdminManagement />} />
          <Route path="/gestion-roles" element={<RoleAccessManagement />} />
        </Route>
      </Route>

      {
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
