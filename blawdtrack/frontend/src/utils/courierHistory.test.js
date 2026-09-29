import { describe, it, expect } from 'vitest';
import { formatHistoryEntry } from './courierHistory';

const BASE = { timestamp: '2026-09-29T14:05:00', actorName: 'Súper Usuario' };

describe('formatHistoryEntry (HU-004 historial)', () => {
  it('traduce los campos modificados a etiquetas en español', () => {
    const row = formatHistoryEntry({ ...BASE, action: 'ACTUALIZAR_MENSAJERO', details: 'fullName, maxPackageWeightKg' }, 0);
    expect(row.text).toBe('Campos modificados: Nombre, Capacidad de carga');
    expect(row.by).toBe('Súper Usuario');
  });

  it('describe el cambio de estado de acceso y que se cerró la sesión', () => {
    expect(formatHistoryEntry({ ...BASE, action: 'DESACTIVAR_MENSAJERO', details: 'status' }, 0).text)
      .toContain('Inactivo');
    expect(formatHistoryEntry({ ...BASE, action: 'ACTIVAR_MENSAJERO', details: 'status' }, 0).text)
      .toContain('Activo');
  });

  it('incluye fecha y hora', () => {
    const row = formatHistoryEntry({ ...BASE, action: 'ACTUALIZAR_MENSAJERO', details: 'email' }, 0);
    expect(row.when).toMatch(/29\/09\/2026 · /);
  });

  it('usa el nombre crudo si el campo no tiene etiqueta y un texto genérico sin detalle', () => {
    expect(formatHistoryEntry({ ...BASE, action: 'ACTUALIZAR_MENSAJERO', details: 'otroCampo' }, 0).text)
      .toBe('Campos modificados: otroCampo');
    expect(formatHistoryEntry({ ...BASE, action: 'ACTUALIZAR_MENSAJERO', details: null }, 0).text)
      .toBe('Datos modificados');
  });

  it('genera ids distintos para entradas con la misma marca de tiempo', () => {
    const a = formatHistoryEntry({ ...BASE, action: 'ACTUALIZAR_MENSAJERO', details: 'email' }, 0);
    const b = formatHistoryEntry({ ...BASE, action: 'ACTUALIZAR_MENSAJERO', details: 'email' }, 1);
    expect(a.id).not.toBe(b.id);
  });
});
