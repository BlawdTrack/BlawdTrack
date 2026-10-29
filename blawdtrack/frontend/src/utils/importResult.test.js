import { describe, it, expect } from 'vitest';
import { buildImportResult, importResultNotice } from './importResult';

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

describe('importResultNotice', () => {
  it('avisa cuántos paquetes se registraron y de qué archivo', () => {
    expect(importResultNotice({ fileName: 'zoho.xlsx', counts: { registered: 3 } })).toEqual({
      message: '3 paquetes registrados de zoho.xlsx. Resumen: 3 importados · 0 duplicados · 0 con error. Los duplicados y los registros con errores se excluyeron.',
      severity: 'success',
    });
  });

  it('resume los importados, los duplicados y los registros con error', () => {
    const { message } = importResultNotice({ fileName: 'zoho.xlsx', counts: { registered: 2, duplicate: 1, invalid: 3 } });

    expect(message).toContain('Resumen: 2 importados · 1 duplicado · 3 con error.');
  });

  it('usa el singular con un solo paquete', () => {
    expect(importResultNotice({ fileName: '', counts: { registered: 1 } }).message).toMatch(/^1 paquete registrado\./);
  });

  it('con cero registrados lo avisa en advertencia', () => {
    expect(importResultNotice({ fileName: 'zoho.xlsx', counts: { registered: 0, duplicate: 1, invalid: 2 } })).toEqual({
      message: 'No se registró ningún paquete: el archivo zoho.xlsx no tenía registros válidos. Resumen: 0 importados · 1 duplicado · 2 con error.',
      severity: 'warning',
    });
  });
});
