import { MAX_SEARCH_TERM_LENGTH } from '../config/packageSearch';

/**
 * Normaliza el texto de búsqueda del usuario para que no envíe espacios, ni
 * cadenas vacías ni términos demasiado largos al backend.
 * @param {string|null|undefined} rawTerm
 * @returns {string}
 */
export function normalizeSearchTerm(rawTerm) {
  if (rawTerm === null || rawTerm === undefined) {
    return '';
  }

  return String(rawTerm).trim().slice(0, MAX_SEARCH_TERM_LENGTH);
}

export default normalizeSearchTerm;
