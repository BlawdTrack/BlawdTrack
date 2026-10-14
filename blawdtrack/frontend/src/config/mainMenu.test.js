import { describe, it, expect } from 'vitest';
import { getMainMenuColumns } from './mainMenu';
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

    expect(byTitle['Importación de paquetes']).toBe(ROUTES.MODULE_PACKAGES);
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
    expect(modulesOf(columns).map((m) => m.path)).toEqual([ROUTES.MODULE_PACKAGES, null, null]);
  });

  it('is empty for roles without menu access', () => {
    expect(getMainMenuColumns(ROLES.COURIER)).toEqual([]);
    expect(getMainMenuColumns('NOPE')).toEqual([]);
  });
});
