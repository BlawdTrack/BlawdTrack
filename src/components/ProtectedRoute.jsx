import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hasActiveSession } from '../utils/authStorage';
import { getHomeRoute } from '../utils/roleRoutes';

// T17: ruta protegida (layout route). Sin sesión válida manda a /login; las
// rutas públicas simplemente quedan fuera de este componente en App.jsx.
//
// `allowedRoles` (opcional) restringe el grupo de rutas a esos roles: cada rol
// solo ve lo que le corresponde (HU-001). Un usuario autenticado con otro rol
// vuelve a SU inicio, sin cerrar sesión y sin mensaje. Sin la prop, basta con
// tener sesión y un rol conocido. Es coherencia de la interfaz; la seguridad real la aplica el
// backend (@PreAuthorize). La matriz fina de permisos por pantalla es HU-009 y
// podrá sumarse como otra prop sin cambiar la estructura de rutas.
export function ProtectedRoute({ allowedRoles }) {
  const { user, expireSession, logout } = useAuth();
  const location = useLocation();

  // Se reevalúa en cada render, y useLocation vuelve a renderizar al navegar
  // entre rutas protegidas: hasActiveSession() detecta el 'exp' vencido del
  // token aunque el estado en memoria todavía tenga al usuario.
  const hasValidSession = Boolean(user) && hasActiveSession();

  // Un rol sin inicio mapeado (desconocido o ausente) no debería existir aquí:
  // AuthContext no deja crear un 'user' así (rechaza el login y limpia la
  // sesión guardada). Es una defensa por si esa garantía se rompiera.
  const homeRoute = user ? getHomeRoute(user.role) : null;
  const hasUnknownRole = hasValidSession && !homeRoute;

  useEffect(() => {
    if (user && !hasValidSession) {
      // Había usuario en memoria pero la sesión ya no es válida: se cierra con
      // el aviso de "sesión expirada". Sin usuario (nunca inició sesión) solo
      // se redirige, sin aviso.
      expireSession();
    } else if (hasUnknownRole) {
      // Se cierra la sesión en silencio (igual que AuthContext con una sesión
      // guardada de rol inválido): dejarla abierta sin pantalla a la que ir
      // sería un callejón sin salida.
      logout();
    }
  }, [user, hasValidSession, hasUnknownRole, expireSession, logout, location.pathname]);

  if (!hasValidSession || hasUnknownRole) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Si el inicio del rol estuviera fuera de su propio grupo (mala
    // configuración en App.jsx), redirigir a él crearía un bucle infinito:
    // se falla cerrado sin renderizar nada. Lo cubre App.routes.test.jsx.
    if (homeRoute === location.pathname) return null;
    return <Navigate to={homeRoute} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
