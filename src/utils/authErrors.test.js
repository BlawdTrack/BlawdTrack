import { describe, it, expect } from 'vitest';
import { getLoginError } from './authErrors';

const httpError = (status, data) => ({ response: { status, data } });

describe('getLoginError', () => {
  it('reports a connection problem when there is no response', () => {
    const out = getLoginError(new Error('Network Error'));
    expect(out.severity).toBe('error');
    expect(out.message).toMatch(/conectar con el servidor/);
    expect(getLoginError(undefined).message).toMatch(/conectar con el servidor/);
  });

  it('maps CUENTA_INACTIVA to a warning about the inactive account', () => {
    const out = getLoginError(httpError(403, { code: 'CUENTA_INACTIVA' }));
    expect(out.severity).toBe('warning');
    expect(out.message).toMatch(/inactiva/);
  });

  it('maps CREDENCIALES_INVALIDAS to a generic credentials error that does not say which field failed', () => {
    const out = getLoginError(httpError(401, { code: 'CREDENCIALES_INVALIDAS', message: 'x' }));
    expect(out.severity).toBe('error');
    expect(out.message).toMatch(/Correo o contraseña incorrectos/);
    expect(out.message).not.toMatch(/solo el correo|solo la contraseña/i);
  });

  it('falls back to the HTTP status when the body has no code', () => {
    expect(getLoginError(httpError(403, {})).severity).toBe('warning');
    expect(getLoginError(httpError(401, undefined)).message).toMatch(/incorrectos/);
  });

  it('prefers the code over the status', () => {
    expect(getLoginError(httpError(401, { code: 'CUENTA_INACTIVA' })).severity).toBe('warning');
  });

  it('uses a generic message for anything else and never shows the backend message', () => {
    const out = getLoginError(httpError(500, { code: 'INTERNAL_ERROR', message: 'stack trace' }));
    expect(out.severity).toBe('error');
    expect(out.message).toMatch(/No se pudo iniciar sesión/);
    expect(out.message).not.toMatch(/stack trace/);
  });
});
