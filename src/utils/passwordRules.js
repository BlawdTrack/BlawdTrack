// Reglas 1-3 del checklist de nueva contraseña (constante `npRules` del bloque
// hu002/r3 de assets/mockup-sprint1.html). Son las únicas que se pueden
// validar en el cliente mientras el usuario escribe.
//
// La regla 4 ("distinta de las últimas 3 contraseñas") NO está aquí a
// propósito: el frontend no tiene ni debe tener el historial de contraseñas;
// solo el backend puede confirmarla o rechazarla al guardar.

export const MIN_PASSWORD_LENGTH = 8;

export function evaluatePasswordRules(password) {
  return {
    length: password.length >= MIN_PASSWORD_LENGTH,
    uppercase: /[A-ZÁÉÍÓÚÑ]/.test(password),
    number: /\d/.test(password),
  };
}

export function meetsClientPasswordRules(password) {
  return Object.values(evaluatePasswordRules(password)).every(Boolean);
}
