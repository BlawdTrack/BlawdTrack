import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '../api/axiosClient';
import { requestPasswordReset, confirmPasswordReset } from './PasswordRecoveryService';

vi.mock('../api/axiosClient', () => ({ default: { post: vi.fn() } }));

describe('PasswordRecoveryService (HU-002)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requestPasswordReset envía el correo al endpoint de solicitud y devuelve el cuerpo', async () => {
    axiosClient.post.mockResolvedValue({ data: { message: 'ok' } });

    await expect(requestPasswordReset('a@b.com')).resolves.toEqual({ message: 'ok' });
    expect(axiosClient.post).toHaveBeenCalledWith('/v1/auth/password-reset/request', { email: 'a@b.com' });
  });

  it('confirmPasswordReset envía token y newPassword al endpoint de confirmación', async () => {
    axiosClient.post.mockResolvedValue({ data: { message: 'listo' } });

    await expect(confirmPasswordReset('tok', 'Nueva123')).resolves.toEqual({ message: 'listo' });
    expect(axiosClient.post).toHaveBeenCalledWith('/v1/auth/password-reset/confirm', {
      token: 'tok',
      newPassword: 'Nueva123',
    });
  });

  it('propaga el error para que la pantalla lo interprete', async () => {
    const error = { response: { status: 400, data: { code: 'INVALID_RESET_TOKEN' } } };
    axiosClient.post.mockRejectedValue(error);

    await expect(confirmPasswordReset('tok', 'Nueva123')).rejects.toBe(error);
  });
});
