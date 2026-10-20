import { describe, expect, it } from 'vitest';
import { buildReceiptSummary, findDeliveredTimestamp, formatProofTimestamp } from './deliveryProof';

describe('formatProofTimestamp', () => {
  it('da la fecha y la hora de 24 horas', () => {
    expect(formatProofTimestamp('2026-09-17T08:30:00')).toBe('17/09/2026 a las 08:30');
  });

  it('sin fecha o con una fecha inválida devuelve null', () => {
    expect(formatProofTimestamp(null)).toBeNull();
    expect(formatProofTimestamp('')).toBeNull();
    expect(formatProofTimestamp('no es una fecha')).toBeNull();
  });
});

describe('findDeliveredTimestamp', () => {
  it('toma la última entrada que pasa a ENTREGADO', () => {
    const entries = [
      { newStatus: 'PENDING', timestamp: '2026-09-16T10:00:00' },
      { newStatus: 'DELIVERED', timestamp: '2026-09-17T08:30:00' },
      { newStatus: 'DELIVERED', timestamp: '2026-09-18T09:00:00' },
    ];

    expect(findDeliveredTimestamp(entries)).toBe('2026-09-18T09:00:00');
  });

  it('ignora las entradas entregadas sin fecha', () => {
    const entries = [
      { newStatus: 'DELIVERED', timestamp: '2026-09-17T08:30:00' },
      { newStatus: 'DELIVERED', timestamp: null },
    ];

    expect(findDeliveredTimestamp(entries)).toBe('2026-09-17T08:30:00');
  });

  it('sin entrega en el historial, o sin historial, devuelve null', () => {
    expect(findDeliveredTimestamp([{ newStatus: 'PENDING', timestamp: '2026-09-16T10:00:00' }])).toBeNull();
    expect(findDeliveredTimestamp(undefined)).toBeNull();
  });
});

describe('buildReceiptSummary', () => {
  it('cuenta la fecha y la firma cuando existen', () => {
    expect(buildReceiptSummary('17/09/2026 a las 08:30', true)).toBe(
      'Entrega registrada el 17/09/2026 a las 08:30. Firma digital registrada al cierre de la entrega.'
    );
  });

  it('no afirma una firma ni una fecha que el backend no entregó', () => {
    expect(buildReceiptSummary(null, false)).toBe('Sin firma digital registrada.');
  });
});
