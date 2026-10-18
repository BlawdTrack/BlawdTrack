import { describe, it, expect } from 'vitest';
import { getPackageStatusMeta } from './packageStatus';

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
});
