import { ROLES } from './roles';
import { ROUTES } from './routes';

// Declarative navigation definition. Adding a screen means adding an entry here;
// no layout component needs to change. Each group is a module with its own menu
// page (`path`) that lists its screens; `path: null` on an item marks a screen
// that is not implemented yet (rendered disabled).
export const NAVIGATION_GROUPS = [
  {
    id: 'couriers',
    title: 'Gestión de mensajeros',
    shortTitle: 'Mensajeros',
    path: ROUTES.MODULE_COURIERS,
    description: 'Registra a tu equipo de reparto, corrige sus datos o retíralo de la operación.',
    items: [
      {
        id: 'courier-create',
        label: 'Crear mensajero',
        description: 'Registra un mensajero con su horario y la capacidad de carga que puede transportar.',
        path: ROUTES.COURIER_CREATE,
        roles: [ROLES.SUPER_USER],
      },
      {
        id: 'courier-update',
        label: 'Actualizar mensajero',
        description: 'Corrige los datos de un mensajero que ya está registrado.',
        path: ROUTES.COURIER_UPDATE,
        roles: [ROLES.SUPER_USER],
      },
      {
        id: 'courier-deactivate',
        label: 'Desactivar mensajero',
        description: 'Retira de la operación a un mensajero; su registro queda en el historial.',
        path: ROUTES.COURIER_DEACTIVATE,
        roles: [ROLES.SUPER_USER],
      },
    ],
  },
  {
    id: 'admins',
    title: 'Gestión de administradores',
    shortTitle: 'Admins',
    path: ROUTES.MODULE_ADMINS,
    description: 'Da de alta a quienes gestionan las ventas o quítales el acceso.',
    items: [
      {
        id: 'admin-create',
        label: 'Crear administrador',
        description: 'Registra a un nuevo administrador de ventas.',
        path: ROUTES.ADMIN_CREATE,
        roles: [ROLES.SUPER_USER],
      },
      {
        id: 'admin-delete',
        label: 'Eliminar administrador',
        description: 'Elimina a un administrador y consulta el historial de auditoría.',
        path: ROUTES.ADMIN_DELETE,
        roles: [ROLES.SUPER_USER],
      },
    ],
  },
  {
    id: 'packages',
    title: 'Gestión de paquetes',
    shortTitle: 'Paquetes',
    path: ROUTES.MODULE_PACKAGES,
    description: 'Importa el archivo de Zoho Inventory y revisa los paquetes antes de registrarlos.',
    items: [
      {
        id: 'package-import',
        label: 'Importar paquetes',
        description: 'Carga el archivo de Zoho Inventory (.xlsx o .csv) con los paquetes del día.',
        path: ROUTES.PACKAGE_IMPORT,
        roles: [ROLES.SUPER_USER, ROLES.SALES_ADMIN],
      },
      {
        id: 'package-duplicates',
        label: 'Detectar duplicados',
        description: 'Identifica los paquetes cuyo número de envío ya está registrado o se repite en el archivo importado.',
        path: ROUTES.PACKAGE_DUPLICATES,
        roles: [ROLES.SUPER_USER, ROLES.SALES_ADMIN],
      },
    ],
  },
  {
    id: 'security',
    title: 'Seguridad y acceso',
    shortTitle: 'Acceso',
    path: ROUTES.MODULE_SECURITY,
    description: 'Cambia tu contraseña y decide qué puede hacer cada persona.',
    items: [
      {
        id: 'password-reset',
        label: 'Restablecer contraseña',
        description: 'Recibe en tu correo un enlace para elegir una contraseña nueva.',
        path: ROUTES.PASSWORD_RESET_OWN,
        roles: [ROLES.SUPER_USER, ROLES.SALES_ADMIN],
      },
      {
        id: 'roles-permissions',
        label: 'Roles y permisos',
        description: 'Ajusta qué puede hacer cada usuario dentro del sistema.',
        path: ROUTES.ROLES_PERMISSIONS,
        roles: [ROLES.SUPER_USER],
      },
    ],
  },
];

/**
 * Menú que le corresponde a un rol: los grupos con solo los ítems permitidos, sin grupos vacíos.
 * @param {string} role Rol de negocio.
 * @returns {Array<{ id: string, title: string, shortTitle: string, path: string, description: string,
 *   items: Array }>}
 */
export function getNavigationForRole(role) {
  return NAVIGATION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
}

/**
 * Roles que pueden entrar a un grupo: la unión de los roles de sus pantallas. `App.jsx` la usa para proteger el
 * menú de cada módulo con el mismo criterio con el que se arma el menú lateral.
 * @param {{ items: Array<{ roles: string[] }> }} group Grupo de `NAVIGATION_GROUPS`.
 * @returns {string[]}
 */
export function getGroupRoles(group) {
  return [...new Set(group.items.flatMap((item) => item.roles))];
}

const isSameOrChildPath = (pathname, path) => pathname === path || pathname.startsWith(`${path}/`);

/**
 * Pantalla a la que lleva la flecha de retorno desde `pathname`: la pantalla de una función vuelve al
 * menú de su módulo, y el menú de un módulo vuelve al menú principal. El menú principal no tiene retorno.
 * @param {string} pathname Ruta actual.
 * @returns {{ to: string, label: string } | null}
 */
export function getBackTarget(pathname) {
  if (NAVIGATION_GROUPS.some((group) => group.path === pathname)) {
    return { to: ROUTES.MAIN_MENU, label: 'Menú principal' };
  }

  const group = NAVIGATION_GROUPS.find((candidate) =>
    candidate.items.some((item) => item.path && isSameOrChildPath(pathname, item.path))
  );
  return group ? { to: group.path, label: group.title } : null;
}
