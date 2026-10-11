import { describe, it, expect } from 'vitest';
import { PREVIEW_STATUS, buildImportPreview, filterPreviewRows, formatDeliveryWindow } from './importPreview';

const validRecord = {
  shipmentNumber: 'BG-1',
  orderNumber: 'ZI-1',
  customerName: 'Ana Mora',
  address: 'Moravia, San José',
  phone: '8712-0094',
  schedule: 'De 9 a 4',
  deliveryWindow: { start: '09:00:00', end: '16:00:00' },
  items: [],
};

const preview = {
  fileName: 'zoho.xlsx',
  totalRecords: 6,
  validRecordsCount: 2,
  invalidRecordsCount: 2,
  duplicateRecordsCount: 2,
  validRecords: [validRecord, { ...validRecord, shipmentNumber: 'BG-2', deliveryWindow: undefined }],
  invalidRecords: [
    {
      packageData: { shipmentNumber: 'BG-3', orderNumber: 'ZI-3', customerName: 'Beto', address: 'Heredia', phone: '', schedule: '' },
      issues: [{ field: 'phone', message: 'El campo teléfono es obligatorio' }],
    },
    { packageData: { shipmentNumber: '', orderNumber: 'ZI-4' }, issues: [{ field: 'shipmentNumber', message: 'El campo número de envío es obligatorio' }, { field: 'customerName', message: 'El campo nombre del cliente es obligatorio' }] },
  ],
  duplicates: [
    { shipmentNumber: 'BG-5', occurrences: 1, reasons: ['ALREADY_REGISTERED'] },
    { shipmentNumber: 'BG-6', occurrences: 3, reasons: ['DUPLICATED_IN_FILE'], customerName: 'Carla', address: 'Alajuela' },
  ],
};

describe('formatDeliveryWindow', () => {
  it.each([
    [{ start: '09:00:00', end: '16:00:00' }, '9:00 a. m. – 4:00 p. m.'],
    [{ start: '08:30', end: '12:00' }, '8:30 a. m. – 12:00 p. m.'],
    [{ start: '00:15:00', end: '23:59:00' }, '12:15 a. m. – 11:59 p. m.'],
    [{ start: [10, 0], end: [14, 30] }, '10:00 a. m. – 2:30 p. m.'],
  ])('da formato al rango %j', (window, expected) => {
    expect(formatDeliveryWindow(window)).toBe(expected);
  });

  it.each([[null], [undefined], [{}], [{ start: '09:00:00' }], [{ start: 'nueve', end: '16:00:00' }], [{ start: '25:00:00', end: '26:00:00' }], [{ start: '09:61:00', end: '16:00:00' }]])(
    'devuelve null si el rango falta o no se entiende (%j)',
    (window) => {
      expect(formatDeliveryWindow(window)).toBeNull();
    }
  );
});

describe('buildImportPreview', () => {
  it.each([[null], [undefined], ['texto'], [42]])('devuelve null si no hay una previsualización utilizable (%s)', (value) => {
    expect(buildImportPreview(value)).toBeNull();
  });

  it('toma el nombre del archivo y los totales que informa el backend', () => {
    expect(buildImportPreview(preview)).toMatchObject({
      fileName: 'zoho.xlsx',
      counts: { read: 6, valid: 2, invalid: 2, duplicate: 2 },
    });
  });

  it('agrupa las filas: válidos, luego con errores y luego duplicados', () => {
    const { rows } = buildImportPreview(preview);

    expect(rows.map((row) => row.status)).toEqual([
      PREVIEW_STATUS.VALID,
      PREVIEW_STATUS.VALID,
      PREVIEW_STATUS.INVALID,
      PREVIEW_STATUS.INVALID,
      PREVIEW_STATUS.DUPLICATE,
      PREVIEW_STATUS.DUPLICATE,
    ]);
  });

  it('un válido trae sus datos y el rango de entrega calculado por el backend', () => {
    const [first, second] = buildImportPreview(preview).rows;

    expect(first).toMatchObject({
      shipmentNumber: 'BG-1',
      orderNumber: 'ZI-1',
      customerName: 'Ana Mora',
      address: 'Moravia, San José',
      phone: '8712-0094',
      schedule: 'De 9 a 4',
      deliveryRange: '9:00 a. m. – 4:00 p. m.',
      notes: [],
    });
    // Mientras el backend no mande el rango, la fila queda sin él.
    expect(second.deliveryRange).toBeNull();
  });

  it('un registro con errores explica cada campo faltante y deja en null lo que no tiene', () => {
    const [, , missingPhone, missingTwo] = buildImportPreview(preview).rows;

    expect(missingPhone.notes).toEqual(['El campo teléfono es obligatorio']);
    expect(missingPhone.phone).toBeNull();
    expect(missingTwo.shipmentNumber).toBeNull();
    expect(missingTwo.notes).toEqual(['El campo número de envío es obligatorio', 'El campo nombre del cliente es obligatorio']);
  });

  it('un duplicado trae la causa y el cliente y la dirección solo si llegan', () => {
    const rows = buildImportPreview(preview).rows;
    const [registered, repeated] = rows.slice(4);

    expect(registered).toMatchObject({ shipmentNumber: 'BG-5', customerName: null, address: null, notes: ['Ya registrado en la base de datos'] });
    expect(repeated).toMatchObject({ shipmentNumber: 'BG-6', customerName: 'Carla', address: 'Alajuela', notes: ['Repetido 3 veces en el archivo'] });
  });

  it('le da a cada fila una clave distinta aunque se repita el número de envío', () => {
    const keys = buildImportPreview({ ...preview, validRecords: [validRecord, validRecord], invalidRecords: [], duplicates: [] }).rows.map((row) => row.key);

    expect(new Set(keys).size).toBe(2);
  });

  it('si el backend no manda los totales, los calcula de las listas', () => {
    const { counts } = buildImportPreview({ validRecords: [validRecord], invalidRecords: [], duplicates: [{ shipmentNumber: 'X', reasons: ['ALREADY_REGISTERED'] }] });

    expect(counts).toEqual({ read: 2, valid: 1, invalid: 0, duplicate: 1 });
  });

  it('tolera listas ausentes o con elementos vacíos', () => {
    const result = buildImportPreview({ fileName: 'a.csv', totalRecords: 0, invalidRecords: [null, {}], duplicates: [null] });

    expect(result.rows).toHaveLength(3);
    expect(result.rows.every((row) => row.shipmentNumber === null)).toBe(true);
  });
});

describe('filterPreviewRows', () => {
  const { rows } = buildImportPreview(preview);

  it('"all" devuelve todas las filas', () => {
    expect(filterPreviewRows(rows, 'all')).toHaveLength(6);
  });

  it.each([
    [PREVIEW_STATUS.VALID, 2],
    [PREVIEW_STATUS.INVALID, 2],
    [PREVIEW_STATUS.DUPLICATE, 2],
  ])('el filtro %s deja solo sus filas (%i)', (status, expected) => {
    const filtered = filterPreviewRows(rows, status);

    expect(filtered).toHaveLength(expected);
    expect(filtered.every((row) => row.status === status)).toBe(true);
  });

  it('un filtro desconocido no deja filas', () => {
    expect(filterPreviewRows(rows, 'otro')).toEqual([]);
  });
});
