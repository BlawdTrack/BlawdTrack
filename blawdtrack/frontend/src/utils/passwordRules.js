// Reglas 1-3 del checklist de nueva contraseña (constante `npRules` del bloque
// hu002/r3 de assets/mockup-sprint1.html). Son las únicas que se pueden
// validar en el cliente mientras el usuario escribe.
//
// La regla 4 ("distinta de las últimas 3 contraseñas") NO está aquí a
// propósito: el frontend no tiene ni debe tener el historial de contraseñas;
// solo el backend puede confirmarla o rechazarla al guardar.

/** Largo mínimo de una contraseña. */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Evalúa cada regla por separado para que la lista de requisitos marque cuáles se cumplen.
 * @param {string} password
 * @returns {{ length: boolean, uppercase: boolean, number: boolean }}
 */
export function evaluatePasswordRules(password) {
  return {
    length: password.length >= MIN_PASSWORD_LENGTH,
    letter: /[A-Za-z]/.test(password),
    number: /\d/.test(password),
  };
}

/** @returns {boolean} `true` si la contraseña cumple todas las reglas que el cliente puede validar. */
export function meetsClientPasswordRules(password) {
  return Object.values(evaluatePasswordRules(password)).every(Boolean);
}
