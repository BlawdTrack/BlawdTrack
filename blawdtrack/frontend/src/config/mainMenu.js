import { ROLES } from './roles';
import { getNavigationForRole } from './navigation';

// Módulos del menú principal. Uno con `groupId` es un grupo de NAVIGATION_GROUPS (ya implementado, con su ruta y sus
// permisos); uno sin `groupId` es un módulo que todavía no existe: se muestra como tarjeta "Próximamente" a los roles
// de `roles`. `muted` lo dibuja atenuado, para la vista propia del mensajero.
const MODULES = {
  packages: {
    groupId: 'packages',
    description: 'Carga los envíos desde Zoho Inventory en Excel o CSV. Los duplicados se detectan en el mismo flujo.',
  },
  'package-management': {
    title: 'Gestión de paquetes',
    description: 'Busca, filtra por estado o pendientes, consulta el detalle, genera el QR, elimina y exporta a Excel.',
    roles: [ROLES.SUPER_USER, ROLES.SALES_ADMIN],
  },
  'assignment-tracking': {
    title: 'Asignación y seguimiento',
    description: 'Asigna paquetes, da seguimiento por mensajero (paquetes, costos, comprobantes) y envíos Uber.',
    roles: [ROLES.SUPER_USER, ROLES.SALES_ADMIN],
  },
  users: { groupId: 'users', description: 'Mensajeros, administradores y roles y permisos.' },
  reports: {
    title: 'Reportes y notificaciones',
    description: 'Cambios en usuarios e historial de notificaciones. Imprime desde cada reporte.',
    roles: [ROLES.SUPER_USER, ROLES.SALES_ADMIN],
  },
  'courier-operation': {
    title: 'Operación de mensajero',
    description: 'Ver paquetes asignados, actualizar estado y registrar costos.',
    roles: [ROLES.SUPER_USER],
    muted: true,
  },
};

// Distribución del menú principal: columnas de secciones con las tarjetas de los módulos (`modules`: ids de MODULES,
// y `description` para cambiar el texto en esa vista) o, en `stats`, las cifras del resumen del día. Cada rol tiene
// la suya; los que no aparecen en LAYOUTS usan la del Súper Usuario.
const SUPER_USER_COLUMNS = [
  [{ id: 'daily-operation', title: 'Operación diaria', modules: ['packages', 'package-management', 'assignment-tracking'] }],
  [
    { id: 'administration', title: 'Administración', modules: ['users', 'reports'] },
    { id: 'courier-view', title: 'Mensajería', modules: ['courier-operation'] },
  ],
];

// Cifras del resumen del día. Todavía no hay de dónde leerlas (la gestión de paquetes no existe): se muestran sin
// valor y con el aviso de que vienen pronto. `tone` es el de `StatCard`.
const TODAY_STATS = [
  { id: 'pending-assignment', label: 'Pendientes de asignar', tone: 'warning' },
  { id: 'in-transit', label: 'En tránsito', tone: 'neutral' },
  { id: 'delivered', label: 'Entregados', tone: 'success' },
  { id: 'not-delivered', label: 'No entregados', tone: 'error' },
];

const SALES_ADMIN_COLUMNS = [
  [{ id: 'daily-operation', title: 'Operación diaria', modules: ['packages', 'package-management', 'assignment-tracking'] }],
  [
    {
      id: 'control',
      title: 'Control y consulta',
      modules: [{ id: 'reports', description: 'Reportes de entregas con filtros, exportación e historial de notificaciones.' }],
    },
    { id: 'today-summary', title: 'Resumen de hoy', modules: [], stats: TODAY_STATS },
  ],
];

const LAYOUTS = { [ROLES.SALES_ADMIN]: SALES_ADMIN_COLUMNS };

/**
 * Columnas del menú principal para un rol: cada sección con los módulos que el rol puede ver (y, si es el resumen del
 * día, sus cifras en `stats`). Un módulo implementado trae su ruta (`path`); uno futuro, `path: null`. Se omiten
 * las secciones y las columnas que quedan vacías.
 * @param {string} role Rol de negocio.
 * @returns {Array<Array<{ id: string, title: string, modules: Array<{ id: string, title: string,
 *   description: string, path: string|null, muted: boolean }>, stats?: Array<{ id: string, label: string,
 *   tone: string }> }>>}
 */
export function getMainMenuColumns(role) {
  const groups = getNavigationForRole(role);
  // Un rol sin acceso al menú (el mensajero) no ve ni las cifras.
  const hasAccess = groups.length > 0;

  const resolve = (entry) => {
    const { id, description: override } = typeof entry === 'string' ? { id: entry } : entry;
    const module = MODULES[id];
    const description = override ?? module.description;
    if (module.groupId) {
      const group = groups.find((candidate) => candidate.id === module.groupId);
      return group ? { id: group.id, title: group.title, description, path: group.path, muted: false } : null;
    }
    return module.roles.includes(role) ? { id, title: module.title, description, path: null, muted: Boolean(module.muted) } : null;
  };

  return (LAYOUTS[role] ?? SUPER_USER_COLUMNS)
    .map((sections) =>
      sections
        .map((section) => ({ id: section.id, title: section.title, modules: section.modules.map(resolve).filter(Boolean), stats: section.stats }))
        .filter((section) => section.modules.length > 0 || (hasAccess && section.stats))
    )
    .filter((sections) => sections.length > 0);
}

/** Aviso de los módulos y pantallas que todavía no existen, en el menú principal y en el lateral. */
export const COMING_SOON_MESSAGE = 'Disponible próximamente';

/**
 * Módulos que muestra el menú lateral para un rol: los mismos del menú principal y en su mismo orden. Los que ya
 * existen vienen como el grupo de `getNavigationForRole` (con sus pantallas); los futuros, como
 * `{ id, title, comingSoon: true }`, para dibujarlos deshabilitados con el aviso al pasar el cursor.
 * @param {string} role Rol de negocio.
 * @returns {Array<object>}
 */
export function getSidebarModules(role) {
  const groups = getNavigationForRole(role);
  return getMainMenuColumns(role)
    .flat()
    .flatMap((section) => section.modules)
    .map((module) => (module.path ? groups.find((group) => group.id === module.id) : { id: module.id, title: module.title, comingSoon: true }));
}
