import { describe, it, expect } from 'vitest';
import {
  NAVIGATION_GROUPS,
  NAVIGATION_MENUS,
  isSingleScreenMenu,
  SETTINGS_MENU,
  getNavigationForRole,
  getSettingsForRole,
  getMenuForRole,
  getParentMenu,
  isGroupActive,
  isModuleScreen,
  getGroupRoles,
} from './navigation';
import { ROLES } from './roles';
import { ROUTES } from './routes';

const allItems = [...NAVIGATION_GROUPS.flatMap((group) => group.items), ...SETTINGS_MENU.items];

describe('navigation config', () => {
  it('gives every group and item a unique id', () => {
    const ids = [...NAVIGATION_MENUS.map((m) => m.id), ...allItems.map((i) => i.id)];
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

  it('orders the groups Usuarios and Paquetes, with no Seguridad y acceso module', () => {
    expect(NAVIGATION_GROUPS.map((g) => g.title)).toEqual(['Gestión de usuarios', 'Importación de paquetes']);
  });

  it('puts Mensajeros and Administradores inside Gestión de usuarios, which lists all their screens and Roles y permisos', () => {
    const users = NAVIGATION_GROUPS.find((g) => g.id === 'users');
    expect(users.submenus.map((s) => s.title)).toEqual(['Mensajeros', 'Administradores']);
    expect(users.directItems.map((i) => i.label)).toEqual(['Roles y permisos']);
    expect(users.items.map((i) => i.id)).toEqual([
      ...users.submenus.flatMap((s) => s.items.map((i) => i.id)),
      ...users.directItems.map((i) => i.id),
    ]);
    expect(NAVIGATION_GROUPS.map((g) => g.id)).not.toContain('couriers');
    expect(NAVIGATION_GROUPS.map((g) => g.id)).not.toContain('admins');
  });

  it('puts only "Importar paquetes" in Importación de paquetes (duplicate detection is part of the import), visible for the super user and the sales admin', () => {
    const packages = NAVIGATION_GROUPS.find((g) => g.id === 'packages');
    expect(packages.items.map((i) => i.label)).toEqual(['Importar paquetes']);
    expect(packages.items.map((i) => i.path)).toEqual([ROUTES.PACKAGE_IMPORT]);
    packages.items.forEach((item) => expect(item.roles).toEqual([ROLES.SUPER_USER, ROLES.SALES_ADMIN]));
  });

  it('puts only "Restablecer contraseña" in Ajustes, which is not a module of the main menu', () => {
    expect(SETTINGS_MENU.title).toBe('Ajustes');
    expect(SETTINGS_MENU.items.map((i) => i.label)).toEqual(['Restablecer contraseña']);
    expect(NAVIGATION_GROUPS).not.toContain(SETTINGS_MENU);
    expect(NAVIGATION_MENUS).toContain(SETTINGS_MENU);
  });
});

describe('getNavigationForRole', () => {
  it('returns every group for the super user', () => {
    const groups = getNavigationForRole(ROLES.SUPER_USER);
    expect(groups.map((g) => g.id)).toEqual(NAVIGATION_GROUPS.map((g) => g.id));
  });

  it('gives the sales admin only the packages group, and their own password reset in Ajustes', () => {
    expect(getNavigationForRole(ROLES.SALES_ADMIN).map((g) => g.id)).toEqual(['packages']);
    expect(getSettingsForRole(ROLES.SALES_ADMIN).items.map((i) => i.id)).toEqual(['password-reset']);
  });

  it('drops the direct items the role cannot use', () => {
    expect(getNavigationForRole(ROLES.SUPER_USER)[0].directItems.map((i) => i.id)).toEqual(['roles-permissions']);
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
    expect(byId.users).toEqual([ROLES.SUPER_USER]);
    expect(byId.packages).toEqual([ROLES.SUPER_USER, ROLES.SALES_ADMIN]);
    expect(getGroupRoles(SETTINGS_MENU)).toEqual([ROLES.SUPER_USER, ROLES.SALES_ADMIN, ROLES.COURIER]);
  });
});

describe('getSettingsForRole', () => {
  it('is the settings menu for the three roles and null for the others', () => {
    [ROLES.SUPER_USER, ROLES.SALES_ADMIN, ROLES.COURIER].forEach((role) =>
      expect(getSettingsForRole(role).items.map((i) => i.id)).toEqual(['password-reset'])
    );
    expect(getSettingsForRole('NOPE')).toBeNull();
  });
});

describe('getMenuForRole', () => {
  it('finds a group or a submenu by id, with only what the role can use', () => {
    expect(getMenuForRole(ROLES.SUPER_USER, 'users').submenus.map((s) => s.id)).toEqual(['couriers', 'admins']);
    expect(getMenuForRole(ROLES.SUPER_USER, 'couriers').items.map((i) => i.id)).toEqual([
      'courier-create',
      'courier-update',
      'courier-deactivate',
    ]);
    expect(getMenuForRole(ROLES.SALES_ADMIN, 'settings').items.map((i) => i.id)).toEqual(['password-reset']);
  });

  it('is undefined for a menu the role has nothing in, or that does not exist', () => {
    expect(getMenuForRole(ROLES.SALES_ADMIN, 'users')).toBeUndefined();
    expect(getMenuForRole(ROLES.SALES_ADMIN, 'couriers')).toBeUndefined();
    expect(getMenuForRole(ROLES.SUPER_USER, 'nope')).toBeUndefined();
  });
});

describe('isGroupActive', () => {
  it('is active on the group menu, on a submenu menu and on any of its screens', () => {
    const users = NAVIGATION_GROUPS.find((g) => g.id === 'users');
    [ROUTES.MODULE_USERS, ROUTES.MODULE_COURIERS, ROUTES.MODULE_ADMINS, ROUTES.COURIER_CREATE, ROUTES.ADMIN_DELETE].forEach((path) =>
      expect(isGroupActive(users, path)).toBe(true)
    );
    expect(isGroupActive(users, ROUTES.PACKAGE_IMPORT)).toBe(false);
    expect(isGroupActive(users, ROUTES.MAIN_MENU)).toBe(false);
  });
});

describe('module menus', () => {
  it('gives every group its own menu route and every item a description', () => {
    const known = Object.values(ROUTES);
    NAVIGATION_MENUS.forEach((menu) => {
      expect(known).toContain(menu.path);
    });
    allItems.forEach((item) => expect(item.description).toBeTruthy());
    allItems.forEach((item) => expect(item.actionLabel).toBeTruthy());
    expect(new Set(NAVIGATION_MENUS.map((m) => m.path)).size).toBe(NAVIGATION_MENUS.length);
  });

  it('gives every submenu a description and an action for its card', () => {
    NAVIGATION_MENUS.filter((menu) => !NAVIGATION_GROUPS.includes(menu) && menu !== SETTINGS_MENU).forEach((submenu) => {
      expect(submenu.description).toBeTruthy();
      expect(submenu.actionLabel).toBeTruthy();
    });
  });
});

describe('single-screen modules', () => {
  it('treats Importación de paquetes as a module that goes straight to its screen, with no menu page of its own', () => {
    const packages = NAVIGATION_GROUPS.find((g) => g.id === 'packages');

    expect(packages.path).toBe(ROUTES.PACKAGE_IMPORT);
    expect(isSingleScreenMenu(packages)).toBe(true);
    expect(NAVIGATION_MENUS.map((m) => m.id)).not.toContain('packages');
  });

  it('keeps a menu page for every module with several functions, and for settings', () => {
    NAVIGATION_GROUPS.filter((g) => g.id !== 'packages').forEach((group) => {
      expect(isSingleScreenMenu(group)).toBe(false);
      expect(NAVIGATION_MENUS).toContain(group);
    });
    expect(NAVIGATION_MENUS).toContain(SETTINGS_MENU);
  });
});

describe('isModuleScreen', () => {
  it('is true on every module menu and on every function screen, including nested and related paths', () => {
    NAVIGATION_MENUS.forEach((menu) => {
      expect(isModuleScreen(menu.path)).toBe(true);
      menu.items.forEach((item) => expect(isModuleScreen(item.path)).toBe(true));
    });
    expect(isModuleScreen(`${ROUTES.COURIER_UPDATE}/1-0345-0678`)).toBe(true);
    expect(isModuleScreen(ROUTES.PACKAGE_IMPORT)).toBe(true);
  });

  it('is false on the main menu and on unknown routes', () => {
    expect(isModuleScreen(ROUTES.MAIN_MENU)).toBe(false);
    expect(isModuleScreen('/no-existe')).toBe(false);
  });
});

describe('getParentMenu', () => {
  it('sends a function screen back to the submenu that lists it', () => {
    expect(getParentMenu(ROUTES.COURIER_CREATE)).toEqual({ to: ROUTES.MODULE_COURIERS, label: 'Mensajeros' });
    expect(getParentMenu(`${ROUTES.COURIER_UPDATE}/1-0345-0678`)).toEqual({ to: ROUTES.MODULE_COURIERS, label: 'Mensajeros' });
    expect(getParentMenu(ROUTES.ADMIN_DELETE)).toEqual({ to: ROUTES.MODULE_ADMINS, label: 'Administradores' });
  });

  it('sends a function of a group without submenus back to the group menu', () => {
    expect(getParentMenu(ROUTES.ROLES_PERMISSIONS)).toEqual({ to: ROUTES.MODULE_USERS, label: 'Gestión de usuarios' });
    expect(getParentMenu(ROUTES.PASSWORD_RESET_OWN)).toEqual({ to: ROUTES.MODULE_SETTINGS, label: 'Ajustes' });
  });

  it('has no parent on the screen of a single-screen module: there is no menu to go back to', () => {
    expect(getParentMenu(ROUTES.PACKAGE_IMPORT)).toBeNull();
  });

  it('sends a submenu back to Gestión de usuarios', () => {
    expect(getParentMenu(ROUTES.MODULE_COURIERS)).toEqual({ to: ROUTES.MODULE_USERS, label: 'Gestión de usuarios' });
    expect(getParentMenu(ROUTES.MODULE_ADMINS)).toEqual({ to: ROUTES.MODULE_USERS, label: 'Gestión de usuarios' });
  });

  it('has no parent on a group menu, on the main menu or on unknown paths', () => {
    [...NAVIGATION_GROUPS, SETTINGS_MENU].forEach((menu) => expect(getParentMenu(menu.path)).toBeNull());
    expect(getParentMenu(ROUTES.MAIN_MENU)).toBeNull();
    expect(getParentMenu('/no-existe')).toBeNull();
  });
});
