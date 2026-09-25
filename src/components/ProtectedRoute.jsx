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
// tener sesión. Es coherencia de la interfaz; la seguridad real la aplica el
// backend (@PreAuthorize). La matriz fina de permisos por pantalla es HU-009 y
// podrá sumarse como otra prop sin cambiar la estructura de rutas.
export function ProtectedRoute({ allowedRoles }) {
  const { user, expireSession } = useAuth();
  const location = useLocation();

  // Se reevalúa en cada render, y useLocation vuelve a renderizar al navegar
  // entre rutas protegidas: hasActiveSession() detecta el 'exp' vencido del
  // token aunque el estado en memoria todavía tenga al usuario.
  const hasValidSession = Boolean(user) && hasActiveSession();

  useEffect(() => {
    // Había usuario en memoria pero la sesión ya no es válida: se cierra con
    // el aviso de "sesión expirada". Sin usuario (nunca inició sesión) solo
    // se redirige, sin aviso.
    if (user && !hasValidSession) expireSession();
  }, [user, hasValidSession, expireSession, location.pathname]);

  if (!hasValidSession) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const homeRoute = getHomeRoute(user.role);
    // Si el inicio del rol estuviera fuera de su propio grupo (mala
    // configuración en App.jsx), redirigir a él crearía un bucle infinito:
    // se falla cerrado sin renderizar nada. Lo cubre App.routes.test.jsx.
    if (!homeRoute || homeRoute === location.pathname) return null;
    return <Navigate to={homeRoute} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
