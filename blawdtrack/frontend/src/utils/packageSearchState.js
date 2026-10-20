/**
 * Determina si la búsqueda o el filtro de estado aplicados están en estado de "sin resultados".
 * @param {{ isFiltering: boolean, results: { content?: Array<any> }|null, isLoading: boolean,
 *   errorMessage: string|null }} state `isFiltering` es verdadero si hay un término o un estado aplicados.
 * @returns {boolean}
 */
export function hasNoSearchMatches({ isFiltering, results, isLoading, errorMessage }) {
  if (!isFiltering || isLoading || errorMessage || results === null) {
    return false;
  }

  return Array.isArray(results?.content) && results.content.length === 0;
}

export default hasNoSearchMatches;
