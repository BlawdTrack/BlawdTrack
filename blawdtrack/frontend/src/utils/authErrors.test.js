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

describe('getLoginError con el contrato de AuthController (codes en inglés)', () => {
  it('401 INVALID_CREDENTIALS → credenciales incorrectas', () => {
    expect(getLoginError(httpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password'))).toEqual(CREDENTIALS);
  });

  it('403 ACCOUNT_INACTIVE → cuenta inactiva (ámbar)', () => {
    expect(getLoginError(httpError(403, 'ACCOUNT_INACTIVE', 'The account is inactive'))).toEqual(INACTIVE);
  });

  it('el mensaje de credenciales no indica cuál dato falló', () => {
    const { message } = getLoginError(httpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password'));
    expect(message.toLowerCase()).not.toMatch(/solo el correo|solo la contraseña|el correo no existe/);
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
