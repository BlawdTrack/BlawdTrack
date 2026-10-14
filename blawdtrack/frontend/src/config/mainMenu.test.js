import { describe, it, expect } from 'vitest';
import { getMainMenuColumns, getSidebarModules, COMING_SOON_MESSAGE } from './mainMenu';
import { ROLES } from './roles';
import { ROUTES } from './routes';

const titles = (columns) => columns.map((sections) => sections.map((s) => s.title));
const modulesOf = (columns) => columns.flat().flatMap((section) => section.modules);

describe('getMainMenuColumns', () => {
  it('splits the super user menu into the sections of the design, in two columns', () => {
    const columns = getMainMenuColumns(ROLES.SUPER_USER);

    expect(titles(columns)).toEqual([['Operación diaria'], ['Administración', 'Mensajería']]);
    expect(columns[0][0].modules.map((m) => m.title)).toEqual(['Importación de paquetes', 'Gestión de paquetes', 'Asignación y seguimiento']);
    expect(columns[1][0].modules.map((m) => m.title)).toEqual(['Gestión de usuarios', 'Reportes y notificaciones']);
    expect(columns[1][1].modules.map((m) => m.title)).toEqual(['Operación de mensajero']);
  });

  it('links only the implemented modules; the others have no path and show as "Próximamente"', () => {
    const modules = modulesOf(getMainMenuColumns(ROLES.SUPER_USER));
    const byTitle = Object.fromEntries(modules.map((m) => [m.title, m.path]));

    // El módulo de una sola pantalla enlaza directo a ella, sin menú intermedio.
    expect(byTitle['Importación de paquetes']).toBe(ROUTES.PACKAGE_IMPORT);
    expect(byTitle['Gestión de usuarios']).toBe(ROUTES.MODULE_USERS);
    ['Gestión de paquetes', 'Asignación y seguimiento', 'Reportes y notificaciones', 'Operación de mensajero'].forEach((title) =>
      expect(byTitle[title]).toBeNull()
    );
  });

  it('draws only the courier view attenuated and gives every module a description', () => {
    const modules = modulesOf(getMainMenuColumns(ROLES.SUPER_USER));

    expect(modules.filter((m) => m.muted).map((m) => m.title)).toEqual(['Operación de mensajero']);
    modules.forEach((m) => expect(m.description).toBeTruthy());
  });

  it('gives the sales admin only what they can use, in a single column', () => {
    const columns = getMainMenuColumns(ROLES.SALES_ADMIN);

    expect(titles(columns)).toEqual([['Operación diaria']]);
    expect(modulesOf(columns).map((m) => m.title)).toEqual(['Importación de paquetes', 'Gestión de paquetes', 'Asignación y seguimiento']);
    expect(modulesOf(columns).map((m) => m.path)).toEqual([ROUTES.PACKAGE_IMPORT, null, null]);
  });

  it('is empty for roles without menu access', () => {
    expect(getMainMenuColumns(ROLES.COURIER)).toEqual([]);
    expect(getMainMenuColumns('NOPE')).toEqual([]);
  });
});

describe('getSidebarModules', () => {
  it('lists the same modules as the main menu, in its order, with the future ones marked as coming soon', () => {
    const modules = getSidebarModules(ROLES.SUPER_USER);

    expect(modules.map((m) => m.title)).toEqual([
      'Importación de paquetes',
      'Gestión de paquetes',
      'Asignación y seguimiento',
      'Gestión de usuarios',
      'Reportes y notificaciones',
      'Operación de mensajero',
    ]);
    expect(modules.filter((m) => m.comingSoon).map((m) => m.id)).toEqual([
      'package-management',
      'assignment-tracking',
      'reports',
      'courier-operation',
    ]);
  });

  it('brings the real groups with their screens so the sidebar can open them', () => {
    const [importation, , , users] = getSidebarModules(ROLES.SUPER_USER);

    expect(importation.items.map((i) => i.id)).toEqual(['package-import']);
    expect(users.submenus.map((s) => s.id)).toEqual(['couriers', 'admins']);
  });

  it('gives the sales admin only what the main menu gives them', () => {
    expect(getSidebarModules(ROLES.SALES_ADMIN).map((m) => m.title)).toEqual([
      'Importación de paquetes',
      'Gestión de paquetes',
      'Asignación y seguimiento',
    ]);
    expect(getSidebarModules(ROLES.COURIER)).toEqual([]);
  });

  it('shares one coming-soon notice', () => {
    expect(COMING_SOON_MESSAGE).toBe('Disponible próximamente');
  });
});
