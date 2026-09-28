import { describe, it, expect } from 'vitest';
import { getLoginError } from './authErrors';

// Arma un error como el que produce axios ante una respuesta del backend.
function httpError(status, code, message) {
  return { response: { status, data: { code, message, status } } };
}

const CREDENTIALS = {
  message: 'Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.',
  severity: 'error',
};
const INACTIVE = {
  message: 'Tu cuenta está inactiva. Contacta a un administrador de BlawdTrack para reactivarla.',
  severity: 'warning',
};

describe('getLoginError con el backend vivo (blawdtrack/, code AUTH_FAILED)', () => {
  it('401 AUTH_FAILED con "Invalid email or password" → credenciales incorrectas', () => {
    expect(getLoginError(httpError(401, 'AUTH_FAILED', 'Invalid email or password'))).toEqual(CREDENTIALS);
  });

  it('401 AUTH_FAILED con "The account is inactive" → cuenta inactiva (ámbar)', () => {
    expect(getLoginError(httpError(401, 'AUTH_FAILED', 'The account is inactive'))).toEqual(INACTIVE);
  });

  it('401 AUTH_FAILED sin mensaje → credenciales incorrectas (no revela nada más)', () => {
    expect(getLoginError(httpError(401, 'AUTH_FAILED'))).toEqual(CREDENTIALS);
  });

  it('el mensaje de credenciales no indica cuál dato falló', () => {
    const { message } = getLoginError(httpError(401, 'AUTH_FAILED', 'Invalid email or password'));
    expect(message.toLowerCase()).not.toMatch(/solo el correo|solo la contraseña|el correo no existe/);
  });
});

describe('getLoginError con los códigos del contrato original', () => {
  it('401 CREDENCIALES_INVALIDAS → credenciales incorrectas', () => {
    expect(getLoginError(httpError(401, 'CREDENCIALES_INVALIDAS'))).toEqual(CREDENTIALS);
  });

  it('403 CUENTA_INACTIVA → cuenta inactiva (ámbar)', () => {
    expect(getLoginError(httpError(403, 'CUENTA_INACTIVA'))).toEqual(INACTIVE);
  });

  it('respaldo por estado HTTP cuando no llega code', () => {
    expect(getLoginError({ response: { status: 401, data: {} } })).toEqual(CREDENTIALS);
    expect(getLoginError({ response: { status: 403, data: {} } })).toEqual(INACTIVE);
  });
});

describe('getLoginError - otros fallos', () => {
  it('sin respuesta del servidor → mensaje de conexión', () => {
    expect(getLoginError(new Error('Network Error')).message).toMatch(/conectar con el servidor/);
  });

  it.each([
    [400, 'VALIDATION_ERROR'],
    [500, 'INTERNAL_ERROR'],
    [403, 'ACCESS_DENIED'],
  ])('%s %s → mensaje genérico', (status, code) => {
    const result = getLoginError(httpError(status, code));
    expect(result.severity).toBe('error');
    expect(result.message).toMatch(/No se pudo iniciar sesión/);
  });
});
