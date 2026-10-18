import axiosClient from '../api/axiosClient';
import { PACKAGES_PATH } from '../api/packagesApi';

// Consulta de paquetes (HU-013, task 124). La ruta base es compartida (`api/packagesApi.js`).
//
// Este módulo es solo la consulta puntual por número de envío. La búsqueda por
// varios criterios de HU-014 vive en su propio `PackageService.js`, así que los
// dos módulos no compiten por la misma ruta y se pueden fusionar en cualquier
// orden.

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
 * Responde 404 si no existe un paquete con ese número de envío (el frontend se
 * guía por el estado HTTP, no por un código concreto del cuerpo).
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

/**
 * Consulta el historial cronológico de cambios de estado de un paquete:
 * `GET /api/v1/packages/{shipmentNumber}/history`.
 *
 * El backend (`PackageHistoryEntry`) devuelve una lista ordenada del evento más
 * antiguo al más reciente; cada entrada trae `timestamp`, `action`, `details`,
 * `actorName`, `previousStatus` y `newStatus`. Responde 404 si el paquete no
 * existe.
 *
 * @param {string} shipmentNumber Número de envío tal como lo escribió el usuario.
 * @returns {Promise<Array<object>>} Los eventos devueltos por el backend.
 * @throws {Error} Si el número de envío viene vacío.
 */
export const getPackageHistory = async (shipmentNumber) => {
  const normalized = normalizeShipmentNumber(shipmentNumber);
  if (!normalized) {
    throw new Error('Ingresa un número de envío válido.');
  }

  const response = await axiosClient.get(
    `${PACKAGES_PATH}/${encodeURIComponent(normalized)}/history`
  );
  return response.data;
};
