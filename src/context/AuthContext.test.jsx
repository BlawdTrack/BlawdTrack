import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';
import { UNKNOWN_ROLE_ERROR } from '../utils/roleRoutes';
import { login as loginService } from '../services/AuthService';

// AuthService.login llama al backend real por axios; se mockea para que
// esta prueba no dependa de un servidor ni de la red.
vi.mock('../services/AuthService', () => ({
  login: vi.fn(),
}));

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthContext - login con rol no reconocido (T12, regresion pedida en revision de PR #58)', () => {
  beforeEach(() => {
    localStorage.clear();
    loginService.mockReset();
  });

  it('no guarda la sesion y deja error en UNKNOWN_ROLE_ERROR, no en el mensaje generico', async () => {
    loginService.mockResolvedValue({
      token: 'fake-token',
      tokenType: 'Bearer',
      expiresInSeconds: 3600,
      user: { id: 1, fullName: 'Usuario de prueba', email: 'prueba@test.com', role: 'ROL_QUE_NO_EXISTE' },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await expect(result.current.login('prueba@test.com', 'clave123')).rejects.toThrow();
    });

    // Si la línea "setError(getLoginError(err))" del catch se ejecuta sin la
    // guarda "if (!err.isRoleValidation)", este assert falla: getLoginError
    // pisa UNKNOWN_ROLE_ERROR con un mensaje genérico de error de login.
    expect(result.current.error).toEqual(UNKNOWN_ROLE_ERROR);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('sí guarda la sesión cuando el rol es válido', async () => {
    loginService.mockResolvedValue({
      token: 'fake-token',
      tokenType: 'Bearer',
      expiresInSeconds: 3600,
      user: { id: 1, fullName: 'Usuario de prueba', email: 'prueba@test.com', role: 'SUPER_USUARIO' },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('prueba@test.com', 'clave123');
    });

    expect(result.current.error).toBeNull();
    expect(result.current.user).toEqual({
      id: 1,
      fullName: 'Usuario de prueba',
      email: 'prueba@test.com',
      role: 'SUPER_USUARIO',
    });
    expect(localStorage.getItem('token')).toBe('fake-token');
  });
});
