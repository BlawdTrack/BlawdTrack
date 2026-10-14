import { ROLES } from './roles';
import { getNavigationForRole } from './navigation';

// Distribución del menú principal: dos columnas de secciones con las tarjetas de los módulos. Un módulo con
// `groupId` es un grupo de NAVIGATION_GROUPS (ya implementado, con su ruta y sus permisos); uno sin `groupId` es un
// módulo que todavía no existe: se muestra como tarjeta "Próximamente" a los roles de `roles`. `muted` lo dibuja
// atenuado, para la vista propia del mensajero.
const COLUMNS = [
  [
    {
      id: 'daily-operation',
      title: 'Operación diaria',
      modules: [
        {
          groupId: 'packages',
          description: 'Carga los envíos desde Zoho Inventory en Excel o CSV. Los duplicados se detectan en el mismo flujo.',
        },
        {
          id: 'package-management',
          title: 'Gestión de paquetes',
          description: 'Busca, filtra por estado o pendientes, consulta el detalle, genera el QR, elimina y exporta a Excel.',
          roles: [ROLES.SUPER_USER, ROLES.SALES_ADMIN],
        },
        {
          id: 'assignment-tracking',
          title: 'Asignación y seguimiento',
          description:
            'Asigna paquetes, da seguimiento por mensajero (paquetes, costos, comprobantes) y envíos Uber.',
          roles: [ROLES.SUPER_USER, ROLES.SALES_ADMIN],
        },
      ],
    },
  ],
  [
    {
      id: 'administration',
      title: 'Administración',
      modules: [
        { groupId: 'users', description: 'Mensajeros, administradores y roles y permisos.' },
        {
          id: 'reports',
          title: 'Reportes y notificaciones',
          description: 'Cambios en usuarios e historial de notificaciones. Imprime desde cada reporte.',
          roles: [ROLES.SUPER_USER],
        },
      ],
    },
    {
      id: 'courier-view',
      title: 'Mensajería',
      modules: [
        {
          id: 'courier-operation',
          title: 'Operación de mensajero',
          description: 'Ver paquetes asignados, actualizar estado y registrar costos.',
          roles: [ROLES.SUPER_USER],
          muted: true,
        },
      ],
    },
  ],
];

/**
 * Columnas del menú principal para un rol: cada sección con los módulos que el rol puede ver. Un módulo implementado
 * trae su ruta (`path`); uno futuro, `path: null`. Se omiten las secciones y las columnas que quedan vacías.
 * @param {string} role Rol de negocio.
 * @returns {Array<Array<{ id: string, title: string, modules: Array<{ id: string, title: string,
 *   description: string, path: string|null, muted: boolean }> }>>}
 */
export function getMainMenuColumns(role) {
  const groups = getNavigationForRole(role);

  const resolve = (module) => {
    if (module.groupId) {
      const group = groups.find((candidate) => candidate.id === module.groupId);
      return group ? { id: group.id, title: group.title, description: module.description, path: group.path, muted: false } : null;
    }
    return module.roles.includes(role)
      ? { id: module.id, title: module.title, description: module.description, path: null, muted: Boolean(module.muted) }
      : null;
  };

  return COLUMNS.map((sections) =>
    sections
      .map((section) => ({ id: section.id, title: section.title, modules: section.modules.map(resolve).filter(Boolean) }))
      .filter((section) => section.modules.length > 0)
  ).filter((sections) => sections.length > 0);
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
