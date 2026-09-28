import { describe, it, expect } from 'vitest';
import { NAVIGATION_GROUPS, getNavigationForRole } from './navigation';
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

  it('puts only "Restablecer contraseña" in Seguridad y acceso', () => {
    const security = NAVIGATION_GROUPS.find((g) => g.id === 'security');
    expect(security.items.map((i) => i.label)).toEqual(['Restablecer contraseña']);
  });
});

describe('getNavigationForRole', () => {
  it('returns every group for the super user', () => {
    const groups = getNavigationForRole(ROLES.SUPER_USER);
    expect(groups.map((g) => g.id)).toEqual(NAVIGATION_GROUPS.map((g) => g.id));
  });

  it('returns nothing for roles without menu access or unknown roles', () => {
    expect(getNavigationForRole(ROLES.COURIER)).toEqual([]);
    expect(getNavigationForRole(ROLES.SALES_ADMIN)).toEqual([]);
    expect(getNavigationForRole('NOPE')).toEqual([]);
    expect(getNavigationForRole(undefined)).toEqual([]);
  });

  it('drops groups left empty after filtering and does not mutate the config', () => {
    const before = JSON.stringify(NAVIGATION_GROUPS);
    getNavigationForRole(ROLES.COURIER);
    expect(JSON.stringify(NAVIGATION_GROUPS)).toBe(before);
  });
});
