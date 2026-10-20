import axiosClient from '../api/axiosClient';
import { ALL_FIELDS, DEFAULT_PAGE, SEARCH_PAGE_SIZE } from '../config/packageSearch';
import { normalizeSearchTerm } from '../utils/packageSearchTerm';

/**
 * Busca paquetes por texto libre con paginación y abort signal opcional. `field` limita la búsqueda a un solo
 * campo; sin él (o con `ALL_FIELDS`) se busca en todos.
 * @param {{ term?: string, field?: string, page?: number, size?: number, signal?: AbortSignal }} params
 * @returns {Promise<object>}
 */
export async function searchPackages({ term = '', field, page = DEFAULT_PAGE, size = SEARCH_PAGE_SIZE, signal } = {}) {
  const params = { page, size };
  const normalizedTerm = normalizeSearchTerm(term);

  if (normalizedTerm) {
    params.term = normalizedTerm;
    if (field && field !== ALL_FIELDS) {
      params.field = field;
    }
  }

  const response = await axiosClient.get('/v1/packages/search', {
    params,
    signal,
  });

  return response.data;
}

export default searchPackages;
