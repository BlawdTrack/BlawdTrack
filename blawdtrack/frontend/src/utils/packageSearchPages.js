/**
 * Páginas de resultados de la búsqueda de paquetes (HU-014). El backend responde con `PageResponse`
 * (`content`, `page`, `size`, `totalElements`, `totalPages`) y la pantalla va sumando páginas con "Cargar más".
 */

/**
 * ¿Quedan más páginas por traer después de la última cargada?
 * @param {{ page?: number, totalPages?: number }|null|undefined} page Última página recibida.
 * @returns {boolean}
 */
export function hasMorePages(page) {
  return Number.isInteger(page?.page) && Number.isInteger(page?.totalPages) && page.page + 1 < page.totalPages;
}

const keyOf = (pkg) => pkg?.id ?? pkg?.shipmentNumber;

/**
 * Suma una página nueva a lo ya cargado. Como el listado va del más nuevo al más antiguo, un paquete registrado
 * mientras se navega corre los demás una posición y podría llegar dos veces: los repetidos se descartan.
 * @param {{ content?: Array<object> }|null|undefined} loaded Páginas ya cargadas (incluye totales y número de página).
 * @param {{ content?: Array<object> }} next Página recién recibida; sus totales y su número reemplazan a los anteriores.
 * @returns {object} La respuesta de `next` con el contenido de ambas.
 */
export function appendPage(loaded, next) {
  const previous = Array.isArray(loaded?.content) ? loaded.content : [];
  const incoming = Array.isArray(next?.content) ? next.content : [];
  const seen = new Set(previous.map(keyOf));
  return { ...next, content: [...previous, ...incoming.filter((pkg) => !seen.has(keyOf(pkg)))] };
}
