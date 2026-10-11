import { describe, it, expect } from 'vitest';
import { buildImportResult } from './importResult';

describe('buildImportResult', () => {
  it.each([[null], [undefined], ['texto'], [42]])('devuelve null si no hay una respuesta utilizable (%s)', (value) => {
    expect(buildImportResult(value)).toBeNull();
  });

  it('toma el archivo, los totales y los números de envío registrados', () => {
    expect(
      buildImportResult({
        fileName: 'zoho.xlsx',
        totalRecords: 6,
        registeredRecordsCount: 3,
        invalidRecordsCount: 2,
        duplicateRecordsCount: 1,
        registeredShipmentNumbers: ['BG-1', 'BG-2', 'BG-3'],
      })
    ).toEqual({
      fileName: 'zoho.xlsx',
      counts: { read: 6, registered: 3, invalid: 2, duplicate: 1 },
      registeredShipmentNumbers: ['BG-1', 'BG-2', 'BG-3'],
    });
  });

  it('si no llega la cantidad registrada la calcula de los números de envío', () => {
    const { counts } = buildImportResult({ registeredShipmentNumbers: ['A', 'B'] });

    expect(counts).toEqual({ read: 0, registered: 2, invalid: 0, duplicate: 0 });
  });

  it('tolera campos ausentes', () => {
    expect(buildImportResult({})).toEqual({
      fileName: '',
      counts: { read: 0, registered: 0, invalid: 0, duplicate: 0 },
      registeredShipmentNumbers: [],
    });
  });
});
