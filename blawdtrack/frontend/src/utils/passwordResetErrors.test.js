import { describe, expect, it } from 'vitest';
import { describeConfirmError, describeRequestError, PASSWORD_RESET_MESSAGES } from './passwordResetErrors';

describe('describeRequestError', () => {
  it('con respuesta del servidor usa el mensaje genérico', () => {
    expect(describeRequestError({ response: { status: 500 } }))
      .toBe('No se pudo procesar la solicitud. Intenta de nuevo en unos minutos.');
  });

  it('sin respuesta avisa de la conexión', () => {
    expect(describeRequestError(new Error('Network Error'))).toBe(PASSWORD_RESET_MESSAGES.connection);
  });
});

const rejected = (code) => ({ response: { data: { code } } });

describe('describeConfirmError', () => {
  it('sin respuesta del servidor avisa de la conexión', () => {
    expect(describeConfirmError(new Error('Network Error'))).toEqual({
      error: { message: PASSWORD_RESET_MESSAGES.connection },
    });
  });

  it('un token inválido manda a la vista de enlace no válido', () => {
    expect(describeConfirmError(rejected('TOKEN_INVALIDO'))).toEqual({ tokenRejected: true });
  });

  it('una contraseña reutilizada marca la regla del historial y el campo de la contraseña', () => {
    expect(describeConfirmError(rejected('CONTRASENA_REUTILIZADA'))).toEqual({
      historyRejected: true,
      error: { message: PASSWORD_RESET_MESSAGES.reused, field: 'newPassword' },
    });
  });

  it('un error de validación marca el campo de la contraseña', () => {
    expect(describeConfirmError(rejected('VALIDATION_ERROR'))).toEqual({
      error: { message: PASSWORD_RESET_MESSAGES.validation, field: 'newPassword' },
    });
  });

  it('cualquier otro código usa el mensaje genérico', () => {
    expect(describeConfirmError(rejected('OTRO'))).toEqual({ error: { message: PASSWORD_RESET_MESSAGES.generic } });
    expect(describeConfirmError({ response: { data: {} } })).toEqual({
      error: { message: PASSWORD_RESET_MESSAGES.generic },
    });
  });
});
