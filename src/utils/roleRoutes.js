// Mapa de rol de negocio -> ruta de inicio (T12). T17 reutiliza este mismo
// mapa para restringir rutas por rol.
export const ROLE_HOME_ROUTES = {
  SUPER_USUARIO: '/administradores',
  ADMIN_VENTAS: '/ventas',
  MENSAJERO: '/mensajero',
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
