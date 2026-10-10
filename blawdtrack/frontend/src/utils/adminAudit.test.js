import { describe, it, expect } from 'vitest';
import { formatAdminAuditEntry } from './adminAudit';
import { formatDateTime } from './dates';

describe('formatAdminAuditEntry', () => {
  const entry = { id: 5, action: 'CREAR_ADMINISTRADOR', details: 'Detalle del backend.', timestamp: '2026-09-15T10:24:00' };

  it('labels creations in green and deletions in red, keeping the backend detail', () => {
    expect(formatAdminAuditEntry(entry)).toMatchObject({
      id: 5,
      text: 'Detalle del backend.',
      by: 'Súper Usuario',
      badge: { label: 'Creación', tone: 'success' },
    });
    expect(formatAdminAuditEntry({ ...entry, action: 'ELIMINAR_ADMINISTRADOR' }).badge).toEqual({ label: 'Eliminación', tone: 'danger' });
  });

  it('falls back to the raw action code for an action it does not know', () => {
    expect(formatAdminAuditEntry({ ...entry, action: 'OTRA_ACCION' }).badge.label).toBe('OTRA_ACCION');
  });

  it('formats the date like the rest of the history lists', () => {
    expect(formatAdminAuditEntry(entry).when).toBe(formatDateTime('2026-09-15T10:24:00'));
  });
});

describe('formatDateTime', () => {
  it('writes the day, month and year followed by the hour', () => {
    expect(formatDateTime('2026-09-15T10:24:00')).toMatch(/^15\/09\/2026 · \d{2}:\d{2}/);
  });
});
