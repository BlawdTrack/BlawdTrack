import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildUserFromLoginResponse,
  saveAuthSession,
  getStoredUser,
  getStoredToken,
  clearAuthSession,
} from './authStorage';

// Forma real del backend vivo (blawdtrack/, auth/dto/LoginResponse.java).
const LOGIN_RESPONSE = {
  token: 'jwt-de-prueba',
  type: 'Bearer',
  id: 7,
  fullName: 'Alicia Prueba',
  email: 'alicia@blawdgourmet.com',
  role: 'SUPER_USUARIO',
  permissions: ['USER_CREATE', 'COURIER_READ'],
};

describe('authStorage con la respuesta plana del backend', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('buildUserFromLoginResponse toma los campos del nivel superior, incluidos los permisos', () => {
    expect(buildUserFromLoginResponse(LOGIN_RESPONSE)).toEqual({
      id: 7,
      fullName: 'Alicia Prueba',
      email: 'alicia@blawdgourmet.com',
      role: 'SUPER_USUARIO',
      permissions: ['USER_CREATE', 'COURIER_READ'],
    });
  });

  it('saveAuthSession guarda el token y el usuario con sus permisos', () => {
    saveAuthSession(LOGIN_RESPONSE);

    expect(getStoredToken()).toBe('jwt-de-prueba');
    expect(getStoredUser()).toEqual({
      id: 7,
      fullName: 'Alicia Prueba',
      email: 'alicia@blawdgourmet.com',
      role: 'SUPER_USUARIO',
      permissions: ['USER_CREATE', 'COURIER_READ'],
    });
  });

  it('el usuario guardado nunca queda con campos undefined con la respuesta real', () => {
    saveAuthSession(LOGIN_RESPONSE);

    const user = getStoredUser();
    expect(user.id).toBeDefined();
    expect(user.fullName).toBeDefined();
    expect(user.role).toBeDefined();
  });

  it('clearAuthSession borra token y usuario', () => {
    saveAuthSession(LOGIN_RESPONSE);
    clearAuthSession();

    expect(getStoredToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });
});
