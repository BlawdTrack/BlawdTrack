/**
 * Textos y traducción de errores de la pantalla "Crear nueva contraseña" (HU-002). Son textos propios del frontend:
 * no se muestra el `message` crudo del backend, que viene en otro idioma.
 */
export const PASSWORD_RESET_MESSAGES = Object.freeze({
  rules: 'La contraseña no cumple todos los requisitos de la lista.',
  mismatch: 'Las contraseñas no coinciden.',
  reused: 'No puedes reutilizar ninguna de tus últimas 3 contraseñas. Elige una diferente.',
  validation: 'La contraseña no cumple los requisitos. Usa al menos 8 caracteres, con letras y números.',
  connection: 'No pudimos conectar con el servidor. Revisa tu conexión a internet e intenta de nuevo.',
  generic: 'No se pudo actualizar la contraseña. Intenta de nuevo en unos minutos.',
  missingToken: 'Este enlace está incompleto. Solicita uno nuevo para restablecer tu contraseña.',
  rejectedToken: 'Este enlace no es válido o ya expiró. Solicita uno nuevo para restablecer tu contraseña.',
});

const REQUEST_MESSAGES = Object.freeze({
  connection: PASSWORD_RESET_MESSAGES.connection,
  generic: 'No se pudo procesar la solicitud. Intenta de nuevo en unos minutos.',
});

/**
 * Mensaje de una falla al pedir el enlace de restablecimiento (pantalla "Recuperar contraseña"). El backend responde
 * siempre 200 si la solicitud llega, así que solo falla por conexión o por un error del servidor.
 * @param {{ response?: object }} err
 * @returns {string}
 */
export function describeRequestError(err) {
  return err?.response ? REQUEST_MESSAGES.generic : REQUEST_MESSAGES.connection;
}

/**
 * Traduce el rechazo del backend a lo que la pantalla debe mostrar.
 * @param {{ response?: { data?: { code?: string } } }} err Error de la llamada a `confirmPasswordReset`.
 * @returns {{ tokenRejected?: boolean, historyRejected?: boolean, error?: { message: string, field?: string } }}
 *   `tokenRejected`: el enlace venció o ya se usó. `historyRejected`: lo confirmó el backend, así que la regla 4 pasa
 *   a "no cumplida". `error`: el aviso del formulario, con el campo que debe marcarse.
 */
export function describeConfirmError(err) {
  if (!err?.response) {
    return { error: { message: PASSWORD_RESET_MESSAGES.connection } };
  }

  switch (err.response.data?.code) {
    case 'TOKEN_INVALIDO':
      return { tokenRejected: true };
    case 'CONTRASENA_REUTILIZADA':
      return { historyRejected: true, error: { message: PASSWORD_RESET_MESSAGES.reused, field: 'newPassword' } };
    case 'VALIDATION_ERROR':
      return { error: { message: PASSWORD_RESET_MESSAGES.validation, field: 'newPassword' } };
    default:
      return { error: { message: PASSWORD_RESET_MESSAGES.generic } };
  }
}
