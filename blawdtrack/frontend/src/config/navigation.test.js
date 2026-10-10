import { describe, it, expect } from 'vitest';
import { NAVIGATION_GROUPS, getNavigationForRole, getBackTarget, getGroupRoles } from './navigation';
import { ROLES } from './roles';
import { ROUTES } from './routes';

const allItems = NAVIGATION_GROUPS.flatMap((group) => group.items);

describe('navigation config', () => {
  it('gives every group and item a unique id', () => {
    const ids = [...NAVIGATION_GROUPS.map((g) => g.id), ...allItems.map((i) => i.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every group a title and a short title for the phone tab bar', () => {
    NAVIGATION_GROUPS.forEach((group) => {
      expect(group.title).toBeTruthy();
      expect(group.shortTitle).toBeTruthy();
    });
  });

  it('never lists the login screen and never leaks HU labels', () => {
    allItems.forEach((item) => {
      expect(item.path).not.toBe(ROUTES.LOGIN);
      expect(item.label).not.toMatch(/HU-?\d+/i);
    });
    NAVIGATION_GROUPS.forEach((group) => expect(group.title).not.toMatch(/HU-?\d+/i));
  });

  it('only points to routes that are declared in ROUTES (or null for unbuilt screens)', () => {
    const known = Object.values(ROUTES);
    allItems.forEach((item) => {
      if (item.path !== null) expect(known).toContain(item.path);
    });
  });

  it('keeps "Actualizar" and "Desactivar" mensajero as different destinations', () => {
    const update = allItems.find((i) => i.id === 'courier-update');
    const deactivate = allItems.find((i) => i.id === 'courier-deactivate');
    expect(update.path).not.toBe(deactivate.path);
    expect(deactivate.path).toBe(ROUTES.COURIER_DEACTIVATE);
  });

  it('orders the groups Mensajeros, Administradores, Paquetes and Seguridad y acceso', () => {
    expect(NAVIGATION_GROUPS.map((g) => g.title)).toEqual([
      'Gestión de mensajeros',
      'Gestión de administradores',
      'Gestión de paquetes',
      'Seguridad y acceso',
    ]);
  });

  it('puts "Importar paquetes" and "Detectar duplicados" in Gestión de paquetes, visible for the super user and the sales admin', () => {
    const packages = NAVIGATION_GROUPS.find((g) => g.id === 'packages');
    expect(packages.items.map((i) => i.label)).toEqual(['Importar paquetes', 'Detectar duplicados']);
    expect(packages.items.map((i) => i.path)).toEqual([ROUTES.PACKAGE_IMPORT, ROUTES.PACKAGE_DUPLICATES]);
    packages.items.forEach((item) => expect(item.roles).toEqual([ROLES.SUPER_USER, ROLES.SALES_ADMIN]));
  });

  it('puts "Restablecer contraseña" and "Roles y permisos" in Seguridad y acceso', () => {
    const security = NAVIGATION_GROUPS.find((g) => g.id === 'security');
    expect(security.items.map((i) => i.label)).toEqual(['Restablecer contraseña', 'Roles y permisos']);
  });
});

describe('getNavigationForRole', () => {
  it('returns every group for the super user', () => {
    const groups = getNavigationForRole(ROLES.SUPER_USER);
    expect(groups.map((g) => g.id)).toEqual(NAVIGATION_GROUPS.map((g) => g.id));
  });

  it('gives the sales admin only the packages group and their own password reset', () => {
    const groups = getNavigationForRole(ROLES.SALES_ADMIN);
    expect(groups.map((g) => g.id)).toEqual(['packages', 'security']);
    expect(groups.find((g) => g.id === 'security').items.map((i) => i.id)).toEqual(['password-reset']);
  });

  it('returns nothing for roles without menu access or unknown roles', () => {
    expect(getNavigationForRole(ROLES.COURIER)).toEqual([]);
    expect(getNavigationForRole('NOPE')).toEqual([]);
    expect(getNavigationForRole(undefined)).toEqual([]);
  });

  it('drops groups left empty after filtering and does not mutate the config', () => {
    const before = JSON.stringify(NAVIGATION_GROUPS);
    getNavigationForRole(ROLES.COURIER);
    expect(JSON.stringify(NAVIGATION_GROUPS)).toBe(before);
  });
});

describe('getGroupRoles', () => {
  it('is the union of the roles of the screens of the group, without repeats', () => {
    const byId = Object.fromEntries(NAVIGATION_GROUPS.map((group) => [group.id, getGroupRoles(group)]));
    expect(byId.couriers).toEqual([ROLES.SUPER_USER]);
    expect(byId.packages).toEqual([ROLES.SUPER_USER, ROLES.SALES_ADMIN]);
    expect(byId.security).toEqual([ROLES.SUPER_USER, ROLES.SALES_ADMIN]);
  });
});

describe('module menus', () => {
  it('gives every group its own menu route and a description, and every item a description', () => {
    const known = Object.values(ROUTES);
    NAVIGATION_GROUPS.forEach((group) => {
      expect(known).toContain(group.path);
      expect(group.description).toBeTruthy();
    });
    allItems.forEach((item) => expect(item.description).toBeTruthy());
    expect(new Set(NAVIGATION_GROUPS.map((g) => g.path)).size).toBe(NAVIGATION_GROUPS.length);
  });
});

describe('getBackTarget', () => {
  it('sends a function screen back to the menu of its module', () => {
    expect(getBackTarget(ROUTES.COURIER_CREATE)).toEqual({ to: ROUTES.MODULE_COURIERS, label: 'Gestión de mensajeros' });
    expect(getBackTarget(ROUTES.ADMIN_DELETE)).toEqual({ to: ROUTES.MODULE_ADMINS, label: 'Gestión de administradores' });
    expect(getBackTarget(ROUTES.ROLES_PERMISSIONS)).toEqual({ to: ROUTES.MODULE_SECURITY, label: 'Seguridad y acceso' });
    expect(getBackTarget(ROUTES.PACKAGE_DUPLICATES)).toEqual({ to: ROUTES.MODULE_PACKAGES, label: 'Gestión de paquetes' });
    expect(getBackTarget(ROUTES.PACKAGE_IMPORT)).toEqual({ to: ROUTES.MODULE_PACKAGES, label: 'Gestión de paquetes' });
  });

  it('also covers nested paths of a function screen', () => {
    expect(getBackTarget(`${ROUTES.COURIER_UPDATE}/1-0345-0678`)).toEqual({
      to: ROUTES.MODULE_COURIERS,
      label: 'Gestión de mensajeros',
    });
  });

  it('sends a module menu back to the main menu', () => {
    NAVIGATION_GROUPS.forEach((group) =>
      expect(getBackTarget(group.path)).toEqual({ to: ROUTES.MAIN_MENU, label: 'Menú principal' })
    );
  });

  it('has no back target on the main menu or on unknown paths', () => {
    expect(getBackTarget(ROUTES.MAIN_MENU)).toBeNull();
    expect(getBackTarget('/no-existe')).toBeNull();
  });
});
