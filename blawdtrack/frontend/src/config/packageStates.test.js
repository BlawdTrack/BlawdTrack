import { describe, it, expect } from 'vitest';
import { isPackageDeletable } from './packageStates';
import { canDeletePackages } from '../utils/packagePermissions';
import { ROLES } from './roles';

describe('packageStates (HU-012)', () => {
  it('solo Pendiente y Asignado son eliminables (misma lista blanca que el backend)', () => {
    const allStatuses = ['PENDING', 'ASSIGNED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'NOT_DELIVERED'];

    expect(allStatuses.filter(isPackageDeletable)).toEqual(['PENDING', 'ASSIGNED']);
  });

  it('un estado desconocido no es eliminable', () => {
    expect(isPackageDeletable('CANCELLED')).toBe(false);
    expect(isPackageDeletable(undefined)).toBe(false);
  });
});

describe('canDeletePackages', () => {
  it('solo el Administrador de Ventas puede eliminar paquetes', () => {
    expect(canDeletePackages(ROLES.SALES_ADMIN)).toBe(true);
    expect(canDeletePackages(ROLES.SUPER_USER)).toBe(false);
    expect(canDeletePackages(ROLES.COURIER)).toBe(false);
    expect(canDeletePackages(undefined)).toBe(false);
  });
});
