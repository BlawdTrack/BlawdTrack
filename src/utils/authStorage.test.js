import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildUserFromLoginResponse,
  saveAuthSession,
  getStoredToken,
  getStoredUser,
  clearAuthSession,
  hasActiveSession,
} from './authStorage';

const loginResponse = (token = 'plain-token') => ({
  token,
  type: 'Bearer',
  id: 1,
  fullName: 'Alicia Admin',
  email: 'alicia@blawdgourmet.com',
  role: 'SUPER_USUARIO',
  permissions: ['USER_CREATE'],
});

const base64Url = (object) =>
  btoa(JSON.stringify(object)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const jwtWithExp = (exp) => `header.${base64Url({ exp })}.signature`;

beforeEach(() => localStorage.clear());

describe('authStorage', () => {
  it('builds the user from the flat login response without the token', () => {
    expect(buildUserFromLoginResponse(loginResponse())).toEqual({
      id: 1,
      fullName: 'Alicia Admin',
      email: 'alicia@blawdgourmet.com',
      role: 'SUPER_USUARIO',
      permissions: ['USER_CREATE'],
    });
  });

  it('saves and reads the token and the user', () => {
    saveAuthSession(loginResponse('abc'));
    expect(getStoredToken()).toBe('abc');
    expect(getStoredUser().email).toBe('alicia@blawdgourmet.com');
    expect(getStoredUser()).not.toHaveProperty('token');
  });

  it('clears both entries', () => {
    saveAuthSession(loginResponse());
    clearAuthSession();
    expect(getStoredToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });

  it('discards corrupt user data without touching the token', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('blawdtrack_user', '{not json');
    expect(getStoredUser()).toBeNull();
    expect(localStorage.getItem('blawdtrack_user')).toBeNull();
    expect(getStoredToken()).toBe('abc');
  });

  describe('hasActiveSession', () => {
    it('is false with nothing stored or with only one of the two entries', () => {
      expect(hasActiveSession()).toBe(false);
      localStorage.setItem('token', 'abc');
      expect(hasActiveSession()).toBe(false);
    });

    it('is true for a non-JWT token (mock token) with a stored user', () => {
      saveAuthSession(loginResponse('not-a-jwt'));
      expect(hasActiveSession()).toBe(true);
    });

    it('is true for a JWT that has not expired', () => {
      saveAuthSession(loginResponse(jwtWithExp(Math.floor(Date.now() / 1000) + 3600)));
      expect(hasActiveSession()).toBe(true);
    });

    it('is false and clears the session for an expired JWT', () => {
      saveAuthSession(loginResponse(jwtWithExp(Math.floor(Date.now() / 1000) - 10)));
      expect(hasActiveSession()).toBe(false);
      expect(getStoredToken()).toBeNull();
      expect(getStoredUser()).toBeNull();
    });
  });
});
