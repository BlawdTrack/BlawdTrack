import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  handleUnauthorizedResponse,
  isSessionExpiredResponse,
  setSessionExpiredHandler,
} from './sessionExpiry';
import axiosClient from './axiosClient';

const TOKEN = 'token-vigente';

// Arma un error como el que produce axios: response.status/data y el config
// de la petición (con el header Authorization que puso el interceptor).
function buildError({
  status = 401,
  code = 'NO_AUTENTICADO',
  url = '/v1/admins',
  authorization = `Bearer ${TOKEN}`,
} = {}) {
  return {
    response: { status, data: code ? { code } : {} },
    config: { url, headers: authorization ? { Authorization: authorization } : {} },
  };
}

describe('sessionExpiry - qué cuenta como sesión expirada (T17)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', TOKEN);
  });

  it('un 401 NO_AUTENTICADO en un endpoint protegido sí cuenta', () => {
    expect(isSessionExpiredResponse(buildError())).toBe(true);
  });

  it('el 401 del login (credenciales incorrectas) NO cuenta', () => {
    const error = buildError({ code: 'CREDENCIALES_INVALIDAS', url: '/v1/auth/login' });
    expect(isSessionExpiredResponse(error)).toBe(false);
  });

  it('un 401 NO_AUTENTICADO en /v1/auth/login o password-reset tampoco cuenta', () => {
    expect(isSessionExpiredResponse(buildError({ url: '/v1/auth/login' }))).toBe(false);
    expect(
      isSessionExpiredResponse(buildError({ url: '/v1/auth/password-reset/request' }))
    ).toBe(false);
  });

  it('un 403 (ACCESO_DENEGADO o CUENTA_INACTIVA) NO cuenta', () => {
    expect(isSessionExpiredResponse(buildError({ status: 403, code: 'ACCESO_DENEGADO' }))).toBe(false);
    expect(isSessionExpiredResponse(buildError({ status: 403, code: 'CUENTA_INACTIVA' }))).toBe(false);
  });

  it('un 401 con otro code, o sin code, NO cuenta', () => {
    expect(isSessionExpiredResponse(buildError({ code: 'OTRO_CODIGO' }))).toBe(false);
    expect(isSessionExpiredResponse(buildError({ code: null }))).toBe(false);
  });

  it('un error sin respuesta (red caída) NO cuenta', () => {
    expect(isSessionExpiredResponse({ message: 'Network Error' })).toBe(false);
  });

  it('un 401 de una petición con un token que ya no es el actual NO cuenta', () => {
    expect(isSessionExpiredResponse(buildError({ authorization: 'Bearer token-viejo' }))).toBe(false);
  });

  it('sin token guardado (sesión ya limpiada) NO cuenta', () => {
    localStorage.clear();
    expect(isSessionExpiredResponse(buildError())).toBe(false);
  });
});

describe('sessionExpiry - aviso al AuthProvider (T17)', () => {
  let unregister;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', TOKEN);
  });

  afterEach(() => {
    if (unregister) unregister();
    unregister = undefined;
  });

  it('varios 401 a la vez avisan una sola vez', () => {
    // El handler real limpia la sesión; los 401 siguientes ya no coinciden.
    const handler = vi.fn(() => localStorage.removeItem('token'));
    unregister = setSessionExpiredHandler(handler);

    handleUnauthorizedResponse(buildError({ url: '/v1/admins' }));
    handleUnauthorizedResponse(buildError({ url: '/v1/couriers' }));
    handleUnauthorizedResponse(buildError({ url: '/v1/admins' }));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('no avisa si el error no es de sesión expirada', () => {
    const handler = vi.fn();
    unregister = setSessionExpiredHandler(handler);

    handleUnauthorizedResponse(buildError({ status: 403, code: 'ACCESO_DENEGADO' }));

    expect(handler).not.toHaveBeenCalled();
  });

  it('desregistrado el handler, no falla ni avisa', () => {
    const handler = vi.fn();
    setSessionExpiredHandler(handler)();

    expect(() => handleUnauthorizedResponse(buildError())).not.toThrow();
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('axiosClient - interceptor de respuesta (T17)', () => {
  const originalAdapter = axiosClient.defaults.adapter;
  let unregister;

  // Simula un backend que responde con el status/code indicado sin salir a la red.
  function respondWith(status, code) {
    axiosClient.defaults.adapter = (config) =>
      Promise.reject(
        Object.assign(new Error(`Request failed with status code ${status}`), {
          config,
          response: { status, data: { code }, config },
        })
      );
  }

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', TOKEN);
  });

  afterEach(() => {
    axiosClient.defaults.adapter = originalAdapter;
    if (unregister) unregister();
    unregister = undefined;
  });

  it('un 401 NO_AUTENTICADO avisa al handler y el error se sigue propagando', async () => {
    const handler = vi.fn();
    unregister = setSessionExpiredHandler(handler);
    respondWith(401, 'NO_AUTENTICADO');

    await expect(axiosClient.get('/v1/admins')).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('el 401 del login (credenciales incorrectas) no avisa y el error llega al llamador', async () => {
    const handler = vi.fn();
    unregister = setSessionExpiredHandler(handler);
    respondWith(401, 'CREDENCIALES_INVALIDAS');

    await expect(axiosClient.post('/v1/auth/login', {})).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('un 403 no avisa', async () => {
    const handler = vi.fn();
    unregister = setSessionExpiredHandler(handler);
    respondWith(403, 'ACCESO_DENEGADO');

    await expect(axiosClient.get('/v1/admins')).rejects.toMatchObject({
      response: { status: 403 },
    });
    expect(handler).not.toHaveBeenCalled();
  });
});
