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

// Forma REAL del backend vivo (blawdtrack/, auth/dto/LoginResponse.java):
// objeto plano, sin 'user' anidado, con 'permissions'.
function loginResponse(role) {
  return {
    token: 'fake-token',
    type: 'Bearer',
    id: 1,
    fullName: 'Usuario de prueba',
    email: 'prueba@test.com',
    role,
    permissions: ['USER_CREATE', 'COURIER_READ'],
  };
}

describe('AuthContext - login (T12)', () => {
  beforeEach(() => {
    localStorage.clear();
    loginService.mockReset();
  });

  it('con rol válido guarda la sesión con id, nombre, correo, rol y permisos', async () => {
    loginService.mockResolvedValue(loginResponse('SUPER_USUARIO'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('prueba@test.com', 'clave123');
    });

    const expectedUser = {
      id: 1,
      fullName: 'Usuario de prueba',
      email: 'prueba@test.com',
      role: 'SUPER_USUARIO',
      permissions: ['USER_CREATE', 'COURIER_READ'],
    };
    expect(result.current.error).toBeNull();
    expect(result.current.user).toEqual(expectedUser);
    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(JSON.parse(localStorage.getItem('blawdtrack_user'))).toEqual(expectedUser);
  });

  it.each(['ADMIN_VENTAS', 'MENSAJERO'])('el rol %s también inicia sesión', async (role) => {
    loginService.mockResolvedValue(loginResponse(role));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('prueba@test.com', 'clave123');
    });

    expect(result.current.user.role).toBe(role);
  });

  it.each(['ROL_QUE_NO_EXISTE', 'constructor', 'toString', undefined])(
    'con el rol no reconocido %s no guarda la sesión y deja error en UNKNOWN_ROLE_ERROR',
    async (role) => {
      loginService.mockResolvedValue(loginResponse(role));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await expect(result.current.login('prueba@test.com', 'clave123')).rejects.toThrow();
      });

      // Si el catch pisara el error con getLoginError, este assert fallaría.
      expect(result.current.error).toEqual(UNKNOWN_ROLE_ERROR);
      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('blawdtrack_user')).toBeNull();
    }
  );
});

describe('AuthContext - sesión restaurada desde localStorage (T12)', () => {
  beforeEach(() => {
    localStorage.clear();
    loginService.mockReset();
  });

  function storeSession(role) {
    localStorage.setItem('token', 'token-guardado'); // no es JWT: se asume vigente
    localStorage.setItem(
      'blawdtrack_user',
      JSON.stringify({ id: 1, fullName: 'Usuario de prueba', email: 'prueba@test.com', role })
    );
  }

  it('con un rol válido guardado, restaura al usuario', () => {
    storeSession('MENSAJERO');

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toMatchObject({ role: 'MENSAJERO' });
    expect(localStorage.getItem('token')).toBe('token-guardado');
  });

  it.each(['ROL_EDITADO_A_MANO', 'constructor', 'toString', '__proto__'])(
    'con el rol inválido %s guardado, limpia la sesión en silencio (sin error visible)',
    (role) => {
      storeSession(role);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('blawdtrack_user')).toBeNull();
    }
  );
});
