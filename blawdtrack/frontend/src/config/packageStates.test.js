import { describe, it, expect } from 'vitest';
import {
  PACKAGE_STATES,
  PACKAGE_STATE_COLORS,
  PACKAGE_STATE_LABELS,
  getPackageStateLabel,
  isPackageDeletable,
} from './packageStates';
import { canDeletePackages } from '../utils/packagePermissions';
import { ROLES } from './roles';

describe('packageStates (HU-012)', () => {
  it('solo Pendiente y Asignado son eliminables (misma lista blanca que el backend)', () => {
    const deletable = Object.values(PACKAGE_STATES).filter(isPackageDeletable);

    expect(deletable).toEqual([PACKAGE_STATES.PENDING, PACKAGE_STATES.ASSIGNED]);
  });

  it('un estado desconocido no es eliminable', () => {
    expect(isPackageDeletable('CANCELLED')).toBe(false);
    expect(isPackageDeletable(undefined)).toBe(false);
  });

  it('cada estado tiene etiqueta y colores', () => {
    Object.values(PACKAGE_STATES).forEach((state) => {
      expect(PACKAGE_STATE_LABELS[state]).toBeTruthy();
      expect(PACKAGE_STATE_COLORS[state]).toEqual({ bg: expect.any(String), text: expect.any(String) });
    });
  });

  it('getPackageStateLabel devuelve el valor tal cual si no conoce el estado', () => {
    expect(getPackageStateLabel(PACKAGE_STATES.IN_TRANSIT)).toBe('En tránsito');
    expect(getPackageStateLabel('OTRO')).toBe('OTRO');
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
