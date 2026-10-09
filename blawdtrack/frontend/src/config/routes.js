/** Rutas de la aplicación en un solo lugar; `App.jsx` las registra y el menú lateral las enlaza. */
export const ROUTES = {
  LOGIN: '/login',
  PASSWORD_RECOVERY: '/password-recovery',
  // Destino del enlace del correo de recuperación (MAIL_LINK_URL del backend).
  PASSWORD_RESET: '/recovery',
  MAIN_MENU: '/main-menu',
  // Mismo flujo que PASSWORD_RECOVERY, pero dentro del menú principal para un
  // usuario ya logueado (mantiene la barra lateral visible).
  PASSWORD_RESET_OWN: '/main-menu/restablecer-contrasena',
  COURIER_CREATE: '/main-menu/couriers/new',
  COURIER_UPDATE: '/editar-mensajero',
  COURIER_DEACTIVATE: '/main-menu/couriers/deactivate',
  ADMIN_CREATE: '/main-menu/admins/new',
  ADMIN_DELETE: '/main-menu/admins/delete',
  ROLES_PERMISSIONS: '/gestion-roles',
  // Inicios de los roles que no usan el menú principal (HU-001 T12).
  SALES_HOME: '/ventas',
  COURIER_HOME: '/mensajero',
  // Restablecer la propia contraseña de esos roles (el Super Usuario usa PASSWORD_RESET_OWN).
  SALES_PASSWORD_RESET: '/ventas/restablecer-contrasena',
  COURIER_PASSWORD_RESET: '/mensajero/restablecer-contrasena',
};
