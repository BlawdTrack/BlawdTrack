import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildUserFromLoginResponse,
  saveAuthSession,
  getStoredToken,
  getStoredUser,
  clearAuthSession,
  hasActiveSession,
} from './authStorage';

// Forma real del backend vivo (blawdtrack/, auth/dto/LoginResponse.java).
const LOGIN_RESPONSE = {
  token: 'jwt-de-prueba',
  type: 'Bearer',
  id: 7,
  fullName: 'Super Usuario',
  email: 'superadmin@blawdgourmet.com',
  role: 'SUPER_USUARIO',
  permissions: ['USER_CREATE', 'COURIER_READ'],
};

const EXPECTED_USER = {
  id: 7,
  fullName: 'Super Usuario',
  email: 'superadmin@blawdgourmet.com',
  role: 'SUPER_USUARIO',
  permissions: ['USER_CREATE', 'COURIER_READ'],
};

const base64Url = (object) =>
  btoa(JSON.stringify(object))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const jwtWithExp = (exp) =>
  `header.${base64Url({ exp })}.signature`;

describe('authStorage con la respuesta plana del backend', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('buildUserFromLoginResponse toma los campos del nivel superior, incluidos los permisos', () => {
    expect(buildUserFromLoginResponse(LOGIN_RESPONSE)).toEqual(
      EXPECTED_USER
    );
  });

  it('saveAuthSession guarda el token y el usuario con sus permisos', () => {
    saveAuthSession(LOGIN_RESPONSE);

    expect(getStoredToken()).toBe('jwt-de-prueba');
    expect(getStoredUser()).toEqual(EXPECTED_USER);
    expect(getStoredUser()).not.toHaveProperty('token');
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

  it('descarta datos de usuario corruptos sin tocar el token', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('blawdtrack_user', '{not json');

    expect(getStoredUser()).toBeNull();
    expect(localStorage.getItem('blawdtrack_user')).toBeNull();
    expect(getStoredToken()).toBe('abc');
  });

  describe('hasActiveSession', () => {
    it('es false sin nada guardado o con solo una de las dos entradas', () => {
      expect(hasActiveSession()).toBe(false);

      localStorage.setItem('token', 'abc');

      expect(hasActiveSession()).toBe(false);
    });

    it('es true con un token que no es JWT (token de mock) y un usuario guardado', () => {
      saveAuthSession({
        ...LOGIN_RESPONSE,
        token: 'not-a-jwt',
      });

      expect(hasActiveSession()).toBe(true);
    });

    it('es true con un JWT que no ha vencido', () => {
      saveAuthSession({
        ...LOGIN_RESPONSE,
        token: jwtWithExp(
          Math.floor(Date.now() / 1000) + 3600
        ),
      });

      expect(hasActiveSession()).toBe(true);
    });

    it('es false y limpia la sesión con un JWT vencido', () => {
      saveAuthSession({
        ...LOGIN_RESPONSE,
        token: jwtWithExp(
          Math.floor(Date.now() / 1000) - 10
        ),
      });

      expect(hasActiveSession()).toBe(false);
      expect(getStoredToken()).toBeNull();
      expect(getStoredUser()).toBeNull();
    });
  });
});