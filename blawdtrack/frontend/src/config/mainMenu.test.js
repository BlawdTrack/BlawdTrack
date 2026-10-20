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
    expect(byTitle['Gestión de paquetes']).toBe(ROUTES.MODULE_PACKAGE_MANAGEMENT);
    expect(byTitle['Gestión de usuarios']).toBe(ROUTES.MODULE_USERS);
    ['Asignación y seguimiento', 'Reportes y notificaciones', 'Operación de mensajero'].forEach((title) =>
      expect(byTitle[title]).toBeNull()
    );
  });

  it('draws only the courier view attenuated and gives every module a description', () => {
    const modules = modulesOf(getMainMenuColumns(ROLES.SUPER_USER));

    expect(modules.filter((m) => m.muted).map((m) => m.title)).toEqual(['Operación de mensajero']);
    modules.forEach((m) => expect(m.description).toBeTruthy());
  });

  it('gives the sales admin their own layout: daily operation, and control with the summary of the day', () => {
    const columns = getMainMenuColumns(ROLES.SALES_ADMIN);

    expect(titles(columns)).toEqual([['Operación diaria'], ['Control y consulta', 'Resumen de hoy']]);
    expect(modulesOf(columns).map((m) => m.title)).toEqual([
      'Importación de paquetes',
      'Gestión de paquetes',
      'Asignación y seguimiento',
      'Reportes y notificaciones',
    ]);
    expect(modulesOf(columns).map((m) => m.path)).toEqual([ROUTES.PACKAGE_IMPORT, ROUTES.MODULE_PACKAGE_MANAGEMENT, null, null]);
  });

  it('gives the sales admin the four counts of the day, with no value yet, and the reports their own description', () => {
    const columns = getMainMenuColumns(ROLES.SALES_ADMIN);
    const summary = columns[1][1];

    expect(summary.stats.map((s) => s.label)).toEqual(['Pendientes de asignar', 'En tránsito', 'Entregados', 'No entregados']);
    summary.stats.forEach((s) => expect(s.value).toBeUndefined());
    expect(columns[1][0].modules[0].description).toBe('Reportes de entregas con filtros, exportación e historial de notificaciones.');
  });

  it('keeps the summary of the day out of the super user menu, and the reports with their own text there', () => {
    const columns = getMainMenuColumns(ROLES.SUPER_USER);

    expect(columns.flat().some((section) => section.stats)).toBe(false);
    expect(modulesOf(columns).find((m) => m.id === 'reports').description).toBe('Cambios en usuarios e historial de notificaciones. Imprime desde cada reporte.');
  });

  it('gives the courier their own day: three counts without data and two modules that are coming soon', () => {
    const columns = getMainMenuColumns(ROLES.COURIER);

    expect(columns).toHaveLength(1);
    const [summary, day] = columns[0];
    expect(summary.hideTitle).toBe(true);
    expect(summary.stats.map((s) => s.label)).toEqual(['Por entregar', 'Entregados', 'No entregados']);
    expect(day.title).toBe('Mi jornada');
    expect(day.modules.map((m) => [m.title, m.path])).toEqual([['Mis paquetes', null], ['Costos del viaje', null]]);
    expect(day.modules[0].description).toBe('Revisa tus paquetes asignados y actualiza su estado al entregar.');
  });

  it('is empty for roles that do not exist', () => {
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
      'Reportes y notificaciones',
    ]);
    expect(getSidebarModules(ROLES.COURIER).map((m) => [m.title, m.comingSoon])).toEqual([['Mis paquetes', true], ['Costos del viaje', true]]);
    expect(getSidebarModules('NOPE')).toEqual([]);
  });

  it('shares one coming-soon notice', () => {
    expect(COMING_SOON_MESSAGE).toBe('Disponible próximamente');
  });
});
