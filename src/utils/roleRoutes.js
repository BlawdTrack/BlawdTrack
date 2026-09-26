// Roles de negocio tal como los devuelve el backend (strings en español, no
// los nombres de RoleName.java). Se usan para declarar qué roles pueden entrar
// a cada grupo de rutas (prop allowedRoles de ProtectedRoute).
export const ROLES = {
  SUPER_USUARIO: 'SUPER_USUARIO',
  ADMIN_VENTAS: 'ADMIN_VENTAS',
  MENSAJERO: 'MENSAJERO',
};

// Mapa de rol de negocio -> ruta de inicio (T12). El inicio de cada rol debe
// estar dentro del grupo de rutas que ese rol puede ver (ver App.jsx); si no,
// ProtectedRoute lo mandaría a un inicio al que no puede entrar.
export const ROLE_HOME_ROUTES = {
  [ROLES.SUPER_USUARIO]: '/administradores',
  [ROLES.ADMIN_VENTAS]: '/ventas',
  [ROLES.MENSAJERO]: '/mensajero',
};

// Devuelve la ruta de inicio del rol, o null si el rol no esta en el mapa
// (rol desconocido o ausente). Object.hasOwn evita que claves heredadas del
// prototipo ("constructor", "toString"...) pasen como roles validos.
export function getHomeRoute(role) {
  return Object.hasOwn(ROLE_HOME_ROUTES, role) ? ROLE_HOME_ROUTES[role] : null;
}

// Error que se muestra en el login cuando el backend responde con un rol
// que el frontend no reconoce (no esta en ROLE_HOME_ROUTES).
export const UNKNOWN_ROLE_ERROR = {
  message:
    'Tu cuenta no tiene un rol válido asignado en el sistema. Contacta a un administrador de BlawdTrack.',
  severity: 'error',
};
