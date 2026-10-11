import { describe, it, expect } from 'vitest';
import {
  PACKAGE_FILE_ACCEPT,
  PACKAGE_FILE_FORMATS_LABEL,
  formatFileSize,
  validatePackageFile,
} from './packageFile';

const fileOf = (name, size = 10) => new File([new Uint8Array(size)], name);

describe('validatePackageFile', () => {
  it.each([['paquetes.xlsx'], ['paquetes.csv'], ['PAQUETES.XLSX'], ['Listado.Csv'], ['zoho 17-09.final.xlsx']])(
    'acepta %s',
    (name) => {
      expect(validatePackageFile(fileOf(name))).toBeNull();
    }
  );

  it.each([['listado.pdf'], ['listado.xls'], ['listado.txt'], ['listado'], ['listado.xlsx.pdf'], ['.xlsx2'], ['']])(
    'rechaza el formato de "%s" con el aviso de formatos admitidos',
    (name) => {
      expect(validatePackageFile(fileOf(name))).toBe('Formato no compatible. Solo se permiten archivos .xlsx y .csv.');
    }
  );

  it('pide un archivo cuando no hay ninguno', () => {
    expect(validatePackageFile(null)).toBe('Selecciona un archivo para continuar.');
    expect(validatePackageFile(undefined)).toBe('Selecciona un archivo para continuar.');
  });

  it('rechaza un archivo vacío', () => {
    expect(validatePackageFile(fileOf('paquetes.xlsx', 0))).toBe('El archivo está vacío. Selecciona otro archivo.');
  });

  it('revisa el formato antes que el tamaño', () => {
    expect(validatePackageFile(fileOf('vacio.pdf', 0))).toMatch(/Formato no compatible/);
  });

  it('expone los formatos para el selector y para los textos', () => {
    expect(PACKAGE_FILE_ACCEPT).toBe('.xlsx,.csv');
    expect(PACKAGE_FILE_FORMATS_LABEL).toBe('.xlsx y .csv');
  });
});

describe('formatFileSize', () => {
  it.each([
    [0, '0 B'],
    [850, '850 B'],
    [1024, '1 KB'],
    [12800, '12,5 KB'],
    [1048576, '1 MB'],
    [1258291, '1,2 MB'],
  ])('%i bytes se muestra como %s', (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });

  it.each([[-1], [NaN], [undefined], [null]])('devuelve vacío para un tamaño no válido (%s)', (bytes) => {
    expect(formatFileSize(bytes)).toBe('');
  });
});
