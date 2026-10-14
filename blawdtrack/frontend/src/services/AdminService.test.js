import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '../api/axiosClient';
import { getAdministrator, updateAdministrator } from './AdminService';

vi.mock('../api/axiosClient', () => ({ default: { get: vi.fn(), patch: vi.fn() } }));

describe('AdminService · actualización de administradores (HU-007)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('busca al administrador por tipo y número de documento y devuelve su perfil', async () => {
    const profile = { id: 4, documentType: 'CEDULA', documentNumber: '2-0345-0987', fullName: 'Ana', status: 'ACTIVE' };
    axiosClient.get.mockResolvedValue({ data: profile });

    await expect(getAdministrator('CEDULA', '2-0345-0987')).resolves.toEqual(profile);
    expect(axiosClient.get).toHaveBeenCalledWith('/v1/admins/CEDULA/2-0345-0987');
  });

  it('codifica el documento en la ruta', async () => {
    axiosClient.get.mockResolvedValue({ data: {} });

    await getAdministrator('PASAPORTE', 'A/B 1');

    expect(axiosClient.get).toHaveBeenCalledWith('/v1/admins/PASAPORTE/A%2FB%201');
  });

  it('actualiza con PATCH enviando solo los cambios y devuelve el perfil actualizado', async () => {
    const updated = { id: 4, fullName: 'Ana Nueva' };
    axiosClient.patch.mockResolvedValue({ data: updated });

    await expect(updateAdministrator('CEDULA', '2-0345-0987', { fullName: 'Ana Nueva' })).resolves.toEqual(updated);
    expect(axiosClient.patch).toHaveBeenCalledWith('/v1/admins/CEDULA/2-0345-0987', { fullName: 'Ana Nueva' });
  });

  it('propaga el error de axios tal cual, para que el normalizador lo interprete', async () => {
    const notFound = { response: { status: 404, data: { code: 'ADMINISTRADOR_NO_EXISTENTE' } } };
    axiosClient.get.mockRejectedValue(notFound);
    axiosClient.patch.mockRejectedValue(notFound);

    await expect(getAdministrator('CEDULA', '1')).rejects.toBe(notFound);
    await expect(updateAdministrator('CEDULA', '1', { fullName: 'X' })).rejects.toBe(notFound);
  });
});
