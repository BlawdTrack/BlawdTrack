import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hasActiveSession } from '../utils/authStorage';

// T17: ruta protegida (layout route). Sin sesión válida manda a /login; las
// rutas públicas simplemente quedan fuera de este componente en App.jsx.
// No restringe por rol (la matriz de permisos es HU-009).
export function ProtectedRoute() {
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

  return <Outlet />;
}

export default ProtectedRoute;
