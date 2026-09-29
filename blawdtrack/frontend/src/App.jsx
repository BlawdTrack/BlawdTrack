// src/App.jsx
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminManagement from './pages/AdminManagement';
import CourierRegistrationPage from './pages/CourierRegistrationPage';
import LoginPage from './pages/LoginPage';
import MainMenuPage from './pages/MainMenuPage';
import SalesHomePage from './pages/SalesHomePage';
import CourierHomePage from './pages/CourierHomePage';
import PasswordRecoveryRequestPage from './pages/PasswordRecoveryRequestPage';
import NewPasswordPage from './pages/NewPasswordPage';
import EditMessenger from './pages/EditMessenger';
import RoleAccessManagement from './pages/RoleAccessManagement'; // Faltaba en tu bloque pero develop lo exige
import { MessengerFleetList } from './components/MessengerFleetList';
import MainMenuLayout from './components/layout/MainMenuLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { ROLES } from './config/roles';
import { ROUTES } from './config/routes';
import { getHomeRoute } from './utils/roleRoutes';

// T12: si ya hay sesión, "/" manda directo al inicio del rol en vez de
// pasar siempre por /login.
function RootRedirect() {
  const { user } = useAuth();
  // Un rol sin inicio mapeado no debería existir (AuthContext no lo permite);
  // si pasara, se trata como sin sesión en vez de navegar a "null".
  const homeRoute = user ? getHomeRoute(user.role) : null;
  return <Navigate to={homeRoute ?? ROUTES.LOGIN} replace />;
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
      onForgotPassword={() => navigate(ROUTES.PASSWORD_RECOVERY)}
    />
  );
}

function PasswordRecoveryRoute() {
  const navigate = useNavigate();

  return <PasswordRecoveryRequestPage onBackToLogin={() => navigate(ROUTES.LOGIN)} />;
}

// Mismo flujo de PasswordRecoveryRoute, pero para un usuario ya logueado
// (sidebar "Restablecer contraseña"): vuelve al menú principal en vez de
// al login.
function OwnPasswordResetRoute() {
  const navigate = useNavigate();

  return <PasswordRecoveryRequestPage onBackToLogin={() => navigate(ROUTES.MAIN_MENU)} />;
}

// T05: destino del enlace del correo. "/recovery?token=..." es el valor por
// defecto de MAIL_LINK_URL en el backend (pendiente de confirmar con ellos).
function NewPasswordRoute() {
  const navigate = useNavigate();

  return (
    <NewPasswordPage
      onGoToLogin={() => navigate(ROUTES.LOGIN, { replace: true })}
      onRequestNewLink={() => navigate(ROUTES.PASSWORD_RECOVERY)}
    />
  );
}

/**
 * Tabla de rutas de la aplicación. Públicas: login, recuperación de contraseña y `/recovery` (enlace
 * del correo). El resto va dentro de un `ProtectedRoute` por rol: el Super Usuario dentro de
 * `MainMenuLayout`, el administrador de ventas en `/ventas` y el mensajero en `/mensajero`.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path={ROUTES.LOGIN} element={<LoginRoute />} />
      <Route path={ROUTES.PASSWORD_RECOVERY} element={<PasswordRecoveryRoute />} />
      <Route path={ROUTES.PASSWORD_RESET} element={<NewPasswordRoute />} />
      {/* T17: login, recuperación y /recovery son públicas. Todo lo demás exige
          sesión válida y va en el grupo del rol que puede verlo (allowedRoles):
          una pantalla nueva se agrega DENTRO del grupo que le corresponde, y si
          es para cualquier rol autenticado, en un grupo <ProtectedRoute />
          sin allowedRoles. Un rol fuera del grupo vuelve a su propio inicio.
          El inicio de cada rol (ROLE_HOME_ROUTES) debe estar en el grupo de ese
          rol, y App.routes.test.jsx se actualiza al agregar rutas. */}
      
      <Route element={<ProtectedRoute allowedRoles={[ROLES.SUPER_USER]} />}>
        {/* Mantenemos el MainMenuLayout de develop para que tu pantalla tenga menú */}
        <Route element={<MainMenuLayout />}>
          <Route path={ROUTES.MAIN_MENU} element={<MainMenuPage />} />
          <Route path={ROUTES.PASSWORD_RESET_OWN} element={<OwnPasswordResetRoute />} />
          <Route path={ROUTES.COURIER_CREATE} element={<CourierRegistrationPage />} />
          <Route path={ROUTES.COURIER_DEACTIVATE} element={<MessengerFleetList />} />
          <Route path={ROUTES.ADMIN_DELETE} element={<AdminManagement />} />
          <Route path={ROUTES.ROLES_PERMISSIONS} element={<RoleAccessManagement />} />

          {/* Rutas de tu feature agregadas y adaptadas */}
          <Route path={ROUTES.COURIER_UPDATE} element={<EditMessenger />} />
          <Route path={`${ROUTES.COURIER_UPDATE}/:documentNumber`} element={<EditMessenger />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.SALES_ADMIN]} />}>
        <Route path={ROUTES.SALES_HOME} element={<SalesHomePage />} />
      </Route>
      
      <Route element={<ProtectedRoute allowedRoles={[ROLES.COURIER]} />}>
        <Route path={ROUTES.COURIER_HOME} element={<CourierHomePage />} />
      </Route>
    </Routes>
  );
}

export default App;