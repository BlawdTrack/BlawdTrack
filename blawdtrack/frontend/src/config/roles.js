/** Identificadores de rol tal como los devuelve el backend en la respuesta del login. */
export const ROLES = {
  SUPER_USER: 'SUPER_USUARIO',
  SALES_ADMIN: 'ADMIN_VENTAS',
  COURIER: 'MENSAJERO',
};

/** Nombre legible de cada rol, para mostrar en pantalla. */
export const ROLE_LABELS = {
  [ROLES.SUPER_USER]: 'Súper Usuario',
  [ROLES.SALES_ADMIN]: 'Administrador de Ventas',
  [ROLES.COURIER]: 'Mensajero',
};
