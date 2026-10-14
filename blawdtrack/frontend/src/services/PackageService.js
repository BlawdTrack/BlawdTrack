import axiosClient from '../api/axiosClient';

// Ruta base de la API de consulta de paquetes (HU-013, task 124).
// El backend la publica como `/api/v1/packages` y `VITE_API_URL` ya incluye
// el `/api`, así que aquí va sin ese prefijo (igual que el resto de servicios).
const PACKAGES_PATH = '/v1/packages';

/**
 * Normaliza el número de envío igual que el backend (`trim` + mayúsculas), para
 * que la búsqueda coincida sin importar cómo lo escriba el usuario.
 * @param {string} shipmentNumber
 * @returns {string}
 */
export const normalizeShipmentNumber = (shipmentNumber) =>
  String(shipmentNumber ?? '').trim().toUpperCase();

/**
 * Consulta el detalle de un paquete por su número de envío:
 * `GET /api/v1/packages/{shipmentNumber}`.
 *
 * El detalle (`PackageDetailResponse`) incluye datos del cliente, la dirección y
 * el horario de entrega y, cuando está asignado, el mensajero (`assignedCourier`).
 * Responde 404 `PACKAGE_NOT_FOUND` si no existe un paquete con ese número.
 *
 * @param {string} shipmentNumber Número de envío tal como lo escribió el usuario.
 * @returns {Promise<object>} El detalle del paquete devuelto por el backend.
 * @throws {Error} Si el número de envío viene vacío.
 */
export const getPackageByShipmentNumber = async (shipmentNumber) => {
  const normalized = normalizeShipmentNumber(shipmentNumber);
  if (!normalized) {
    throw new Error('Ingresa un número de envío válido.');
  }

  const response = await axiosClient.get(`${PACKAGES_PATH}/${encodeURIComponent(normalized)}`);
  return response.data;
};
