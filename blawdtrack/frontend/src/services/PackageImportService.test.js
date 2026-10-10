import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '../api/axiosClient';
import { previewPackageImport } from './PackageImportService';

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
});
