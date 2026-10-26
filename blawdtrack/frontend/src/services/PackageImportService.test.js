import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '../api/axiosClient';
import { confirmPackageImport, previewPackageImport } from './PackageImportService';

vi.mock('../api/axiosClient', () => ({ default: { postForm: vi.fn() } }));

describe('PackageImportService (HU-010)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía el archivo como multipart a la previsualización y devuelve el cuerpo', async () => {
    const file = new File(['x'], 'paquetes.xlsx');
    const preview = { fileName: 'paquetes.xlsx', totalRecords: 3, duplicates: [] };
    axiosClient.postForm.mockResolvedValue({ data: preview });

    await expect(previewPackageImport(file)).resolves.toEqual(preview);
    expect(axiosClient.postForm).toHaveBeenCalledWith('/v1/packages/import/preview', { file });
  });

  it('propaga el error de axios tal cual, para que el normalizador lo interprete', async () => {
    const error = { response: { status: 400, data: { code: 'INVALID_PACKAGE_FILE' } } };
    axiosClient.postForm.mockRejectedValue(error);

    await expect(previewPackageImport(new File(['x'], 'a.csv'))).rejects.toBe(error);
  });

  it('confirma la importación enviando el archivo como multipart a /import y devuelve el resultado', async () => {
    const file = new File(['x'], 'paquetes.xlsx');
    const result = { fileName: 'paquetes.xlsx', registeredRecordsCount: 2, registeredShipmentNumbers: ['BG-1', 'BG-2'] };
    axiosClient.postForm.mockResolvedValue({ data: result });

    await expect(confirmPackageImport(file)).resolves.toEqual(result);
    expect(axiosClient.postForm).toHaveBeenCalledWith('/v1/packages/import', { file });
  });

  it('propaga el error de la confirmación tal cual', async () => {
    const error = { response: { status: 403 } };
    axiosClient.postForm.mockRejectedValue(error);

    await expect(confirmPackageImport(new File(['x'], 'a.csv'))).rejects.toBe(error);
  });
});
