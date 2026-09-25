import { ROLES } from './roles';
import { ROUTES } from './routes';

// Declarative sidebar definition. Adding a screen means adding an entry here;
// no layout component needs to change. `path: null` marks a screen that is
// not implemented yet (rendered disabled).
export const NAVIGATION_GROUPS = [
  {
    id: 'security',
    title: 'Seguridad y acceso',
    shortTitle: 'Acceso',
    items: [
      {
        id: 'password-reset',
        label: 'Restablecer contraseña',
        path: ROUTES.PASSWORD_RECOVERY,
        roles: [ROLES.SUPER_USER],
      },
    ],
  },
  {
    id: 'couriers',
    title: 'Mensajeros',
    shortTitle: 'Mensajeros',
    items: [
      { id: 'courier-create', label: 'Crear mensajero', path: ROUTES.COURIER_CREATE, roles: [ROLES.SUPER_USER] },
      { id: 'courier-update', label: 'Actualizar mensajero', path: null, roles: [ROLES.SUPER_USER] },
      { id: 'courier-deactivate', label: 'Desactivar mensajero', path: ROUTES.COURIER_DEACTIVATE, roles: [ROLES.SUPER_USER] },
    ],
  },
  {
    id: 'admins',
    title: 'Administradores',
    shortTitle: 'Admins',
    items: [
      { id: 'admin-create', label: 'Crear administrador', path: null, roles: [ROLES.SUPER_USER] },
      { id: 'admin-delete', label: 'Eliminar administrador', path: ROUTES.ADMIN_DELETE, roles: [ROLES.SUPER_USER] },
    ],
  },
  {
    id: 'permissions',
    title: 'Roles y permisos',
    shortTitle: 'Permisos',
    items: [{ id: 'roles-permissions', label: 'Roles y permisos', path: null, roles: [ROLES.SUPER_USER] }],
  },
];

export function getNavigationForRole(role) {
  return NAVIGATION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
}
