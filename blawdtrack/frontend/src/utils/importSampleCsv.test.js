import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadCsv, SAMPLE_CSV_CONTENT, SAMPLE_CSV_FILE_NAME } from './importSampleCsv';

describe('SAMPLE_CSV_CONTENT', () => {
  const [header, ...rows] = SAMPLE_CSV_CONTENT.trim().split('\r\n');

  it('trae las columnas obligatorias de Zoho y las opcionales que lee la importación', () => {
    expect(header.split(',')).toEqual([
      'Packing Number', 'SO Number', 'Customer Name', 'Shipping Address', 'Shipping Phone', 'Schedule', 'Item Name', 'Quantity Packed',
    ]);
  });

  it('pone entre comillas las direcciones con coma y agrupa dos filas en un mismo paquete', () => {
    expect(rows).toHaveLength(3);
    expect(rows[0]).toContain('"San José, Escazú"');
    expect(rows[0].split(',')[0]).toBe(rows[1].split(',')[0]);
  });
});

describe('downloadCsv', () => {
  afterEach(() => vi.restoreAllMocks());

  it('descarga el archivo con el nombre indicado y libera la URL temporal', () => {
    URL.createObjectURL = vi.fn(() => 'blob:ejemplo');
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      expect(this.download).toBe(SAMPLE_CSV_FILE_NAME);
      expect(this.href).toBe('blob:ejemplo');
    });

    downloadCsv(SAMPLE_CSV_FILE_NAME, SAMPLE_CSV_CONTENT);

    expect(click).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:ejemplo');
  });
});
