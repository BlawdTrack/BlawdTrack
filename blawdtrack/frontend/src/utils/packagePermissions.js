import { ROLES } from '../config/roles';

/**
 * ¿El rol puede eliminar paquetes? Solo el Administrador de Ventas (HU-012). Único lugar de esta regla en el
 * frontend; ocultar el botón es solo experiencia de usuario: la seguridad real la aplica el backend (403).
 * @param {string|undefined} role Rol de negocio del usuario autenticado.
 * @returns {boolean}
 */
export const canDeletePackages = (role) => role === ROLES.SALES_ADMIN;
