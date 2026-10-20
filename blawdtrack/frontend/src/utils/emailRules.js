const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida un correo escrito en un formulario: obligatorio (sin contar espacios) y con formato válido. Lo comparten el
 * inicio de sesión y la recuperación de contraseña.
 * @param {string} value Lo que escribió la persona.
 * @returns {string} El mensaje del error, o `''` si el correo es válido.
 */
export function validateEmail(value) {
  const email = value.trim();

  if (!email) return 'El correo electrónico es obligatorio.';
  if (!EMAIL_REGEX.test(email)) return 'Ingresa un correo electrónico con un formato válido.';
  return '';
}
