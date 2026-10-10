/** Rutas de la aplicación en un solo lugar; `App.jsx` las registra y el menú lateral las enlaza. */
export const ROUTES = {
  LOGIN: '/login',
  PASSWORD_RECOVERY: '/password-recovery',
  // Destino del enlace del correo de recuperación (MAIL_LINK_URL del backend).
  PASSWORD_RESET: '/recovery',
  MAIN_MENU: '/main-menu',
  // Menú de cada módulo: lista las funciones del módulo que el rol puede usar (ver NAVIGATION_GROUPS).
  MODULE_COURIERS: '/main-menu/mensajeros',
  MODULE_ADMINS: '/main-menu/administradores',
  MODULE_PACKAGES: '/main-menu/paquetes',
  MODULE_SECURITY: '/main-menu/seguridad',
  // Mismo flujo que PASSWORD_RECOVERY, pero dentro del menú principal para un
  // usuario ya logueado (mantiene la barra lateral visible). Lo usan el Súper Usuario y el Administrador de Ventas.
  PASSWORD_RESET_OWN: '/main-menu/restablecer-contrasena',
  PACKAGE_IMPORT: '/main-menu/paquetes/importar',
  PACKAGE_DUPLICATES: '/main-menu/paquetes/duplicados',
  COURIER_CREATE: '/main-menu/couriers/new',
  COURIER_UPDATE: '/editar-mensajero',
  COURIER_DEACTIVATE: '/main-menu/couriers/deactivate',
  ADMIN_CREATE: '/main-menu/admins/new',
  ADMIN_DELETE: '/main-menu/admins/delete',
  ROLES_PERMISSIONS: '/gestion-roles',
  // Inicio del rol que no usa el menú principal (HU-001 T12). El Administrador de Ventas usa el menú principal.
  COURIER_HOME: '/mensajero',
  // Restablecer la propia contraseña del Mensajero (los otros dos roles usan PASSWORD_RESET_OWN).
  COURIER_PASSWORD_RESET: '/mensajero/restablecer-contrasena',
};
