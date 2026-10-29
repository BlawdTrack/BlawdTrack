import { describe, it, expect } from 'vitest';
import realBackendResponse from './fixtures/packageImportPreview.real.json';
import { PREVIEW_STATUS, buildImportPreview, describeRowIdentity, filterPreviewRows, formatDeliveryWindow, listInvalidRows } from './importPreview';

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
  totalRecords: 8,
  validRecordsCount: 2,
  invalidRecordsCount: 2,
  duplicateRecordsCount: 4,
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

describe('describeRowIdentity', () => {
  it('identifica el registro por su envío, su orden y su cliente', () => {
    expect(describeRowIdentity({ shipmentNumber: 'PK-2', orderNumber: 'SO-2', customerName: 'Ana' })).toBe('Envío PK-2 · Orden SO-2 · Cliente Ana');
  });

  it('no repite la orden cuando es igual al número de envío', () => {
    expect(describeRowIdentity({ shipmentNumber: 'SO-2', orderNumber: 'SO-2', customerName: null })).toBe('Envío SO-2');
  });

  it('avisa cuando el registro no trae ningún dato para identificarlo', () => {
    expect(describeRowIdentity({})).toBe('Registro sin número');
  });
});

describe('listInvalidRows', () => {
  it('lista solo los registros con error con su identidad y sus motivos', () => {
    const rows = buildImportPreview(preview).rows;

    expect(listInvalidRows(rows)).toEqual([
      { key: expect.any(String), identity: 'Envío BG-3 · Orden ZI-3 · Cliente Beto', reasons: ['El campo teléfono es obligatorio'] },
      {
        key: expect.any(String),
        identity: 'Orden ZI-4',
        reasons: ['El campo número de envío es obligatorio', 'El campo nombre del cliente es obligatorio'],
      },
    ]);
  });
});

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
      counts: { read: 8, valid: 2, invalid: 2, duplicate: 4 },
    });
  });

  it('cuenta las causas de duplicado por fila y de forma excluyente: las 3 copias de un repetido cuentan 3', () => {
    const { duplicateCauses, counts } = buildImportPreview(preview);

    expect(duplicateCauses).toEqual({ alreadyRegistered: 1, duplicatedInFile: 3 });
    expect(duplicateCauses.alreadyRegistered + duplicateCauses.duplicatedInFile).toBe(counts.duplicate);
  });

  it('un número repetido 3 veces aparece 3 veces en la lista, como lo cuenta el backend, con claves distintas', () => {
    const { rows } = buildImportPreview(preview);
    const copies = rows.filter((row) => row.shipmentNumber === 'BG-6');

    expect(copies).toHaveLength(3);
    expect(new Set(copies.map((row) => row.key)).size).toBe(3);
    expect(copies.every((row) => row.notes[0] === 'Repetido 3 veces en el archivo')).toBe(true);
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
    const [registered, repeated] = [rows[4], rows[5]];

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
    expect(filterPreviewRows(rows, 'all')).toHaveLength(8);
  });

  it.each([
    [PREVIEW_STATUS.VALID, 2],
    [PREVIEW_STATUS.INVALID, 2],
    [PREVIEW_STATUS.DUPLICATE, 4],
  ])('el filtro %s deja solo sus filas (%i)', (status, expected) => {
    const filtered = filterPreviewRows(rows, status);

    expect(filtered).toHaveLength(expected);
    expect(filtered.every((row) => row.status === status)).toBe(true);
  });

  it('un filtro desconocido no deja filas', () => {
    expect(filterPreviewRows(rows, 'otro')).toEqual([]);
  });
});

// `fixtures/packageImportPreview.real.json` es la respuesta de `POST /api/v1/packages/import/preview` del backend de
// Luis F (rama fix/HU010-task265-resolver-comentarios-pr), copiada tal cual al cargar un CSV con 4 paquetes
// válidos, uno agrupado de 3 filas, uno sin teléfono y uno ya registrado.
describe('buildImportPreview con la respuesta real del backend', () => {
  const result = buildImportPreview(realBackendResponse);

  it('los totales del backend suman el total de registros leídos', () => {
    const { read, valid, invalid, duplicate } = result.counts;

    expect(read).toBe(7);
    expect(valid + invalid + duplicate).toBe(read);
    expect(result.counts).toEqual({ read: 7, valid: 5, invalid: 1, duplicate: 1 });
    expect(result.rows).toHaveLength(7);
  });

  it('el duplicado es el número ya registrado, contado como una fila de esa causa', () => {
    expect(result.duplicateCauses).toEqual({ alreadyRegistered: 1, duplicatedInFile: 0 });
    expect(result.rows.find((row) => row.status === PREVIEW_STATUS.DUPLICATE)).toMatchObject({
      shipmentNumber: 'ENV-0900',
      notes: ['Ya registrado en la base de datos'],
    });
  });

  it('el registro sin teléfono trae el motivo del backend', () => {
    expect(result.rows.find((row) => row.status === PREVIEW_STATUS.INVALID)).toMatchObject({
      shipmentNumber: 'ENV-2005',
      phone: null,
      notes: ['El campo teléfono es obligatorio'],
    });
  });

  it('hoy el backend no manda el rango de entrega: los válidos quedan "sin calcular"', () => {
    const valid = result.rows.filter((row) => row.status === PREVIEW_STATUS.VALID);

    expect(valid).toHaveLength(5);
    expect(valid.every((row) => row.deliveryRange === null)).toBe(true);
    expect(valid.find((row) => row.shipmentNumber === 'ENV-2004').schedule).toBe('9:00 a.m. a 4:00 p.m.');
  });
});
