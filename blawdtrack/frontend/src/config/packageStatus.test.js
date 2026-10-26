import { describe, it, expect } from 'vitest';
import { getPackageStatusDotColor, getPackageStatusMeta } from './packageStatus';

describe('getPackageStatusMeta', () => {
  it('traduce cada estado del backend a una etiqueta en español', () => {
    expect(getPackageStatusMeta('PENDING').label).toBe('Pendiente');
    expect(getPackageStatusMeta('ASSIGNED').label).toBe('Asignado');
    expect(getPackageStatusMeta('SHIPPED').label).toBe('Enviado');
    expect(getPackageStatusMeta('IN_TRANSIT').label).toBe('En tránsito');
    expect(getPackageStatusMeta('DELIVERED').label).toBe('Entregado');
    expect(getPackageStatusMeta('NOT_DELIVERED').label).toBe('No entregado');
  });

  it('marca como desconocido un estado fuera del catálogo, sin inventar etiqueta', () => {
    const meta = getPackageStatusMeta('ALGO_NUEVO');
    expect(meta.known).toBe(false);
    expect(meta.label).toBe('Estado desconocido');
  });

  it('maneja un estado ausente', () => {
    expect(getPackageStatusMeta(null).known).toBe(false);
    expect(getPackageStatusMeta(undefined).known).toBe(false);
  });
it('da el color del indicador del historial según el estado real', () => {
    // Verde para los estados de avance; naranja solo para el cierre (entregado).
    expect(getPackageStatusDotColor('PENDING')).toBe('#2E8055');
    expect(getPackageStatusDotColor('ASSIGNED')).toBe('#2E8055');
    expect(getPackageStatusDotColor('SHIPPED')).toBe('#2E8055');
    expect(getPackageStatusDotColor('IN_TRANSIT')).toBe('#2E8055');
    expect(getPackageStatusDotColor('DELIVERED')).toBe('#FF6B00');
    // No entregado usa el rojo de error de la app; un estado fuera del catálogo, el neutro.
    expect(getPackageStatusDotColor('NOT_DELIVERED')).toBe('#C0392B');
    expect(getPackageStatusDotColor('ALGO_NUEVO')).toBe('#6B6560');
    expect(getPackageStatusDotColor(null)).toBe('#6B6560');
  });
});
