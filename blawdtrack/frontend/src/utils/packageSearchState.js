import { normalizeSearchTerm } from './packageSearchTerm';

/**
 * Determina si la búsqueda actual está en estado de "sin resultados".
 * @param {{ term: string, results: { content?: Array<any> }|null, isLoading: boolean, errorMessage: string|null }} state
 * @returns {boolean}
 */
export function hasNoSearchMatches({ term, results, isLoading, errorMessage }) {
  const normalizedTerm = normalizeSearchTerm(term);

  if (!normalizedTerm || isLoading || errorMessage || results === null) {
    return false;
  }

  return Array.isArray(results?.content) && results.content.length === 0;
}

export default hasNoSearchMatches;
