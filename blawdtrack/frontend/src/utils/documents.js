/**
 * Deja solo letras y números en minúscula, para comparar documentos sin importar guiones, espacios ni
 * mayúsculas ("1-0345-0678" y "103450678" son el mismo documento).
 * @param {unknown} value
 * @returns {string}
 */
export const normalizeDocument = (value) => (value ?? '').toString().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
