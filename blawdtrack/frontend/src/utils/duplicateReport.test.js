import { describe, it, expect } from 'vitest';
import { DUPLICATE_REASONS, buildDuplicateReport, describeDuplicate } from './duplicateReport';

const { ALREADY_REGISTERED, DUPLICATED_IN_FILE } = DUPLICATE_REASONS;

describe('describeDuplicate', () => {
  it('explica un número que ya está en la base de datos', () => {
    expect(describeDuplicate({ reasons: [ALREADY_REGISTERED], occurrences: 1 })).toBe('Ya registrado en la base de datos');
  });

  it('cuenta las veces que se repite dentro del archivo', () => {
    expect(describeDuplicate({ reasons: [DUPLICATED_IN_FILE], occurrences: 3 })).toBe('Repetido 3 veces en el archivo');
  });

  it('no inventa un número de veces si solo llega una ocurrencia', () => {
    expect(describeDuplicate({ reasons: [DUPLICATED_IN_FILE], occurrences: 1 })).toBe('Repetido en el archivo');
    expect(describeDuplicate({ reasons: [DUPLICATED_IN_FILE] })).toBe('Repetido en el archivo');
  });

  it('junta las dos causas cuando el número está registrado y repetido', () => {
    expect(describeDuplicate({ reasons: [ALREADY_REGISTERED, DUPLICATED_IN_FILE], occurrences: 2 })).toBe(
      'Ya registrado en la base de datos · Repetido 2 veces en el archivo'
    );
  });

  it('devuelve vacío sin causas conocidas', () => {
    expect(describeDuplicate({ reasons: ['OTRA'] })).toBe('');
    expect(describeDuplicate({})).toBe('');
  });
});

describe('buildDuplicateReport', () => {
  const preview = {
    fileName: 'zoho.xlsx',
    totalRecords: 9,
    validRecordsCount: 5,
    invalidRecordsCount: 1,
    duplicates: [
      { shipmentNumber: 'BG-1', occurrences: 1, reasons: [ALREADY_REGISTERED], customerName: 'Ana Mora', address: 'Moravia' },
      { shipmentNumber: 'BG-2', occurrences: 2, reasons: [DUPLICATED_IN_FILE] },
      { shipmentNumber: 'BG-3', occurrences: 3, reasons: [ALREADY_REGISTERED, DUPLICATED_IN_FILE] },
    ],
  };

  it.each([[null], [undefined], ['texto'], [42]])('devuelve null si no hay una previsualización utilizable (%s)', (value) => {
    expect(buildDuplicateReport(value)).toBeNull();
  });

  it('copia el archivo, el total y los válidos que informa el backend', () => {
    expect(buildDuplicateReport(preview)).toMatchObject({ fileName: 'zoho.xlsx', totalRecords: 9, validCount: 5, duplicateCount: 3 });
  });

  it('cuenta las causas de forma excluyente: un número registrado y repetido cuenta solo como registrado', () => {
    const report = buildDuplicateReport(preview);

    expect(report.alreadyRegisteredCount).toBe(2);
    expect(report.duplicatedInFileCount).toBe(1);
    expect(report.alreadyRegisteredCount + report.duplicatedInFileCount).toBe(report.duplicateCount);
  });

  it('arma una fila por duplicado con su nota y deja en null el cliente y la dirección que no llegan', () => {
    const [first, second] = buildDuplicateReport(preview).duplicates;

    expect(first).toEqual({
      shipmentNumber: 'BG-1',
      customerName: 'Ana Mora',
      address: 'Moravia',
      note: 'Ya registrado en la base de datos',
    });
    expect(second).toEqual({ shipmentNumber: 'BG-2', customerName: null, address: null, note: 'Repetido 2 veces en el archivo' });
  });

  it('sin duplicados devuelve un reporte válido con ceros', () => {
    const report = buildDuplicateReport({ fileName: 'a.csv', totalRecords: 4, validRecordsCount: 4, duplicates: [] });

    expect(report).toMatchObject({ duplicateCount: 0, alreadyRegisteredCount: 0, duplicatedInFileCount: 0, duplicates: [] });
  });

  it('calcula el total si el backend no lo envía y tolera campos ausentes', () => {
    const report = buildDuplicateReport({ validRecordsCount: 2, invalidRecordsCount: 1, duplicates: [{ shipmentNumber: 'X', reasons: [ALREADY_REGISTERED] }] });

    expect(report.totalRecords).toBe(4);
    expect(report.fileName).toBe('');
  });

  it('tolera una respuesta sin la lista de duplicados', () => {
    expect(buildDuplicateReport({ fileName: 'a.csv', totalRecords: 1, validRecordsCount: 1 }).duplicates).toEqual([]);
  });
});
