import axiosClient from '../api/axiosClient';
import { DEFAULT_PAGE, SEARCH_PAGE_SIZE } from '../config/packageSearch';
import { normalizeSearchTerm } from '../utils/packageSearchTerm';

/**
 * Busca paquetes por texto libre con paginación y abort signal opcional.
 * @param {{ term?: string, page?: number, size?: number, signal?: AbortSignal }} params
 * @returns {Promise<object>}
 */
export async function searchPackages({ term = '', page = DEFAULT_PAGE, size = SEARCH_PAGE_SIZE, signal } = {}) {
  const params = { page, size };
  const normalizedTerm = normalizeSearchTerm(term);

  if (normalizedTerm) {
    params.term = normalizedTerm;
  }

  const response = await axiosClient.get('/v1/packages/search', {
    params,
    signal,
  });

  return response.data;
}

export default searchPackages;
