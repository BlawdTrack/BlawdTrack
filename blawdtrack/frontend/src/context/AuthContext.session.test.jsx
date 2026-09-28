import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';
import { SESSION_EXPIRED_ERROR, handleUnauthorizedResponse } from '../api/sessionExpiry';
import { login as loginService } from '../services/AuthService';

// AuthService.login llama al backend real; se mockea para no depender de la red.
vi.mock('../services/AuthService', () => ({
  login: vi.fn(),
}));

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

// Forma real del backend vivo (blawdtrack/): objeto plano con permissions.
const LOGIN_RESPONSE = {
  token: 'token-vigente',
  type: 'Bearer',
  id: 1,
  fullName: 'Usuario de prueba',
  email: 'prueba@test.com',
  role: 'SUPER_USUARIO',
  permissions: ['USER_CREATE'],
};

describe('AuthContext - sesión expirada por 401 (T17)', () => {
  beforeEach(() => {
    localStorage.clear();
    loginService.mockReset();
  });

  it('un 401 NO_AUTENTICADO limpia la sesión, deja user = null y el aviso warning', async () => {
    loginService.mockResolvedValue(LOGIN_RESPONSE);
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('prueba@test.com', 'clave123');
    });
    expect(result.current.user).not.toBeNull();

    // Lo que hace el interceptor de axios al recibir el 401 de un endpoint protegido.
    act(() => {
      handleUnauthorizedResponse({
        response: { status: 401, data: { code: 'NO_AUTENTICADO' } },
        config: { url: '/v1/admins', headers: { Authorization: 'Bearer token-vigente' } },
      });
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toEqual(SESSION_EXPIRED_ERROR);
    expect(result.current.error.severity).toBe('warning');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('blawdtrack_user')).toBeNull();
  });

  it('el 401 de credenciales incorrectas NO cierra la sesión ni pisa el mensaje de T13', async () => {
    loginService.mockResolvedValue(LOGIN_RESPONSE);
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('prueba@test.com', 'clave123');
    });

    act(() => {
      handleUnauthorizedResponse({
        response: { status: 401, data: { code: 'CREDENCIALES_INVALIDAS' } },
        config: { url: '/v1/auth/login', headers: { Authorization: 'Bearer token-vigente' } },
      });
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.error).toBeNull();
    expect(localStorage.getItem('token')).toBe('token-vigente');
  });
});
