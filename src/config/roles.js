// Role identifiers as returned by the backend login response.
export const ROLES = {
  SUPER_USER: 'SUPER_USUARIO',
  SALES_ADMIN: 'ADMIN_VENTAS',
  COURIER: 'MENSAJERO',
};

// Human readable role names shown on screen.
export const ROLE_LABELS = {
  [ROLES.SUPER_USER]: 'Súper Usuario',
  [ROLES.SALES_ADMIN]: 'Administrador de Ventas',
  [ROLES.COURIER]: 'Mensajero',
};
