/**
 * Iniciales (máximo dos, en mayúscula) de un nombre completo, para los avatares.
 * @param {string} [fullName='']
 * @returns {string} Por ejemplo `'María Solano'` → `'MS'`.
 */
export const getInitials = (fullName = '') =>
  fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
