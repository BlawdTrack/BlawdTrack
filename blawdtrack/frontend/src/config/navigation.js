import { ROLES } from './roles';
import { ROUTES } from './routes';

// Declarative navigation definition. Adding a screen means adding an entry here;
// no layout component needs to change. Each group is a module with its own menu
// page (`path`) that lists its screens; `path: null` on an item marks a screen
// that is not implemented yet (rendered disabled). `actionLabel` is the short action shown in the
// footer of the screen's card; `tone: 'danger'` paints that card red (actions that remove something).
//
// A group can also hold `submenus`: menus of their own (same shape as a group, with `description` for their
// card) that its menu page lists, together with its `directItems` (screens that belong to the group itself, not to a
// submenu). The group's `items` still list every screen of its submenus plus its direct ones, so the role checks
// work the same as with any other group.
//
// `SETTINGS_MENU` ("Ajustes") is not a module of the main menu: the sidebar reaches it from the gear at its bottom.
const COURIER_MENU = {
  id: 'couriers',
  title: 'Mensajeros',
  description: 'Registra a tu equipo de reparto, corrige sus datos o retíralo de la operación.',
  actionLabel: 'Ver funciones',
  path: ROUTES.MODULE_COURIERS,
  items: [
    {
      id: 'courier-create',
      label: 'Crear mensajero',
      description: 'Registra un mensajero con su horario y la capacidad de carga que puede transportar.',
      actionLabel: 'Registrar nuevo',
      path: ROUTES.COURIER_CREATE,
      roles: [ROLES.SUPER_USER],
    },
    {
      id: 'courier-update',
      label: 'Actualizar mensajero',
      description: 'Corrige los datos de un mensajero que ya está registrado.',
      actionLabel: 'Editar datos',
      path: ROUTES.COURIER_UPDATE,
      roles: [ROLES.SUPER_USER],
    },
    {
      id: 'courier-deactivate',
      label: 'Desactivar mensajero',
      description: 'Retira de la operación a un mensajero; su registro queda en el historial.',
      actionLabel: 'Retirar de la operación',
      tone: 'danger',
      path: ROUTES.COURIER_DEACTIVATE,
      roles: [ROLES.SUPER_USER],
    },
  ],
};

const ADMIN_MENU = {
  id: 'admins',
  title: 'Administradores',
  description: 'Da de alta a quienes gestionan las ventas o quítales el acceso.',
  actionLabel: 'Ver funciones',
  path: ROUTES.MODULE_ADMINS,
  items: [
    {
      id: 'admin-create',
      label: 'Crear administrador',
      description: 'Registra a un nuevo administrador de ventas.',
      actionLabel: 'Registrar nuevo',
      path: ROUTES.ADMIN_CREATE,
      roles: [ROLES.SUPER_USER],
    },
    {
      id: 'admin-delete',
      label: 'Eliminar administrador',
      description: 'Elimina a un administrador y consulta el historial de auditoría.',
      actionLabel: 'Eliminar y auditar',
      tone: 'danger',
      path: ROUTES.ADMIN_DELETE,
      roles: [ROLES.SUPER_USER],
    },
  ],
};

const ROLES_ITEM = {
  id: 'roles-permissions',
  label: 'Roles y permisos',
  description: 'Ajusta qué puede hacer cada usuario dentro del sistema.',
  actionLabel: 'Ajustar permisos',
  path: ROUTES.ROLES_PERMISSIONS,
  roles: [ROLES.SUPER_USER],
};

export const NAVIGATION_GROUPS = [
  {
    id: 'users',
    title: 'Gestión de usuarios',
    shortTitle: 'Usuarios',
    path: ROUTES.MODULE_USERS,
    submenus: [COURIER_MENU, ADMIN_MENU],
    directItems: [ROLES_ITEM],
    items: [...COURIER_MENU.items, ...ADMIN_MENU.items, ROLES_ITEM],
  },
  {
    id: 'packages',
    title: 'Importación de paquetes',
    shortTitle: 'Importación',
    // Un módulo de una sola pantalla: su `path` es el de la pantalla y no tiene menú intermedio de tarjetas.
    path: ROUTES.PACKAGE_IMPORT,
    items: [
      {
        id: 'package-import',
        label: 'Importar paquetes',
        description: 'Carga el archivo de Zoho Inventory (.xlsx o .csv) con los paquetes del día.',
        actionLabel: 'Cargar archivo',
        path: ROUTES.PACKAGE_IMPORT,
        roles: [ROLES.SUPER_USER, ROLES.SALES_ADMIN],
      },
    ],
  },
];

/** Menú de ajustes: se abre desde la tuerca del menú lateral (y desde la pestaña "Ajustes" del teléfono). */
export const SETTINGS_MENU = {
  id: 'settings',
  title: 'Ajustes',
  path: ROUTES.MODULE_SETTINGS,
  items: [
    {
      id: 'password-reset',
      label: 'Restablecer contraseña',
      description: 'Recibe en tu correo un enlace para elegir una contraseña nueva.',
      actionLabel: 'Recibir enlace',
      path: ROUTES.PASSWORD_RESET_OWN,
      roles: [ROLES.SUPER_USER, ROLES.SALES_ADMIN],
    },
  ],
};

/**
 * Indica si un grupo es un módulo de una sola pantalla: su `path` es el de su única función, así que el módulo lleva
 * directo a ella (sin menú de tarjetas en medio).
 * @param {{ path: string, items: Array<{ path: string|null }> }} menu
 * @returns {boolean}
 */
export function isSingleScreenMenu(menu) {
  return menu.items.length === 1 && menu.items[0].path === menu.path;
}

/**
 * Todos los menús que tienen página propia (de tarjetas): los grupos, los submenús de los grupos que los tienen y el
 * de ajustes. Los módulos de una sola pantalla no tienen menú. `App.jsx` registra una ruta por cada uno.
 */
export const NAVIGATION_MENUS = [
  ...NAVIGATION_GROUPS.flatMap((group) => [group, ...(group.submenus ?? [])]),
  SETTINGS_MENU,
].filter((menu) => !isSingleScreenMenu(menu));

/** Copia de un menú con solo los ítems permitidos al rol (y los submenús que se quedan con alguno). */
function filterMenuByRole(menu, role) {
  const filtered = { ...menu, items: menu.items.filter((item) => item.roles.includes(role)) };
  if (menu.directItems) filtered.directItems = menu.directItems.filter((item) => item.roles.includes(role));
  if (menu.submenus) {
    filtered.submenus = menu.submenus
      .map((submenu) => filterMenuByRole(submenu, role))
      .filter((submenu) => submenu.items.length > 0);
  }
  return filtered;
}

/**
 * Menú que le corresponde a un rol: los grupos con solo los ítems permitidos, sin grupos vacíos.
 * @param {string} role Rol de negocio.
 * @returns {Array<{ id: string, title: string, shortTitle: string, path: string, items: Array,
 *   submenus?: Array }>}
 */
export function getNavigationForRole(role) {
  return NAVIGATION_GROUPS.map((group) => filterMenuByRole(group, role)).filter((group) => group.items.length > 0);
}

/**
 * Un menú con página propia (grupo o submenú) con solo lo que su rol puede usar, o `undefined` si el rol no tiene
 * nada en él o no existe.
 * @param {string} role Rol de negocio.
 * @param {string} menuId Id de un grupo o de un submenú.
 */
export function getMenuForRole(role, menuId) {
  const settings = getSettingsForRole(role);
  const menus = getNavigationForRole(role).flatMap((group) => [group, ...(group.submenus ?? [])]);
  return [...menus, ...(settings ? [settings] : [])].find((menu) => menu.id === menuId);
}

/**
 * El menú de ajustes con solo lo que el rol puede usar, o `null` si no tiene nada ahí (entonces no se muestra la tuerca).
 * @param {string} role Rol de negocio.
 */
export function getSettingsForRole(role) {
  const settings = filterMenuByRole(SETTINGS_MENU, role);
  return settings.items.length > 0 ? settings : null;
}

/**
 * Roles que pueden entrar a un menú: la unión de los roles de sus pantallas. `App.jsx` la usa para proteger el
 * menú de cada módulo con el mismo criterio con el que se arma el menú lateral.
 * @param {{ items: Array<{ roles: string[] }> }} menu Grupo o submenú de `NAVIGATION_MENUS`.
 * @returns {string[]}
 */
export function getGroupRoles(menu) {
  return [...new Set(menu.items.flatMap((item) => item.roles))];
}

const isSameOrChildPath = (pathname, path) => pathname === path || pathname.startsWith(`${path}/`);

/** Grupo y pantalla (ítem) a los que pertenece `pathname`, o `null` si no es la pantalla de una función. */
function findScreen(pathname) {
  for (const group of [...NAVIGATION_GROUPS, SETTINGS_MENU]) {
    const item = group.items.find((candidate) =>
      [candidate.path, ...(candidate.relatedPaths ?? [])].some((path) => path && isSameOrChildPath(pathname, path))
    );
    if (item) return { group, item };
  }
  return null;
}

/**
 * Indica si `pathname` es el menú de un módulo (o de uno de sus submenús) o la pantalla de una de sus funciones
 * (incluidas rutas anidadas y pantallas del mismo flujo). Falso en el menú principal y fuera de los módulos.
 * @param {string} pathname Ruta actual.
 * @returns {boolean}
 */
export function isModuleScreen(pathname) {
  return NAVIGATION_MENUS.some((menu) => menu.path === pathname) || findScreen(pathname) !== null;
}

/**
 * Indica si `pathname` pertenece al grupo: su menú, el de uno de sus submenús o una de sus pantallas. Lo usan el
 * menú lateral y la barra inferior para marcar el grupo activo.
 * @param {{ path: string, items: Array<{ path: string|null }>, submenus?: Array<{ path: string }> }} group
 * @param {string} pathname Ruta actual.
 * @returns {boolean}
 */
export function isGroupActive(group, pathname) {
  return (
    [group, ...(group.submenus ?? [])].some((menu) => menu.path === pathname) ||
    group.items.some((item) => item.path === pathname)
  );
}

/**
 * Menú al que lleva la flecha junto al título desde `pathname`: la pantalla de una función vuelve al menú que la
 * lista (su submenú, o su grupo si no tiene) y el menú de un submenú vuelve al de su grupo. El menú de un grupo no
 * tiene flecha: para salir de ahí está el enlace al menú principal. La pantalla de un módulo de una sola pantalla
 * tampoco (no tiene menú al que volver).
 * @param {string} pathname Ruta actual.
 * @returns {{ to: string, label: string } | null}
 */
export function getParentMenu(pathname) {
  const group = NAVIGATION_GROUPS.find((candidate) => candidate.submenus?.some((submenu) => submenu.path === pathname));
  if (group) return { to: group.path, label: group.title };

  const screen = findScreen(pathname);
  if (!screen) return null;
  if (isSingleScreenMenu(screen.group)) return null;
  const menu = screen.group.submenus?.find((submenu) => submenu.items.includes(screen.item)) ?? screen.group;
  return { to: menu.path, label: menu.title };
}
