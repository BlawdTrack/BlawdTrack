import axiosClient from '../api/axiosClient';
import { ALL_FIELDS, ALL_STATUSES, DEFAULT_PAGE, SEARCH_PAGE_SIZE } from '../config/packageSearch';
import { normalizeSearchTerm } from '../utils/packageSearchTerm';

/**
 * Busca paquetes por texto libre con paginación y abort signal opcional. `field` limita la búsqueda a un solo
 * campo; sin él (o con `ALL_FIELDS`) se busca en todos. `status` la limita a un estado del paquete (sin él, o con
 * `ALL_STATUSES`, a todos); se puede pedir sin término para listar solo los de ese estado.
 * @param {{ term?: string, field?: string, status?: string, page?: number, size?: number,
 *   signal?: AbortSignal }} params
 * @returns {Promise<object>}
 */
export async function searchPackages({ term = '', field, status, page = DEFAULT_PAGE, size = SEARCH_PAGE_SIZE, signal } = {}) {
  const params = { page, size };
  const normalizedTerm = normalizeSearchTerm(term);

  if (normalizedTerm) {
    params.term = normalizedTerm;
    if (field && field !== ALL_FIELDS) {
      params.field = field;
    }
  }
  if (status && status !== ALL_STATUSES) {
    params.status = status;
  }

  const response = await axiosClient.get('/v1/packages/search', {
    params,
    signal,
  });

  return response.data;
}

/**
 * Cantidad de paquetes por estado (clave: estado del backend, p. ej. `PENDING`), para las pestañas del filtro.
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<Record<string, number>>}
 */
export async function fetchStatusCounts({ signal } = {}) {
  const response = await axiosClient.get('/v1/packages/status-counts', { signal });
  return response.data;
}

export default searchPackages;
