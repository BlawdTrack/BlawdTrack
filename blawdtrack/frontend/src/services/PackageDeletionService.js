import axiosClient from '../api/axiosClient';

// Ruta de paquetes del backend. `VITE_API_URL` ya incluye el `/api`, así que aquí va sin ese prefijo.
const PACKAGES_PATH = '/v1/packages';

/**
 * Elimina un paquete por su número de envío (HU-012): `DELETE /api/v1/packages/{shipmentNumber}`. Solo el
 * Administrador de Ventas puede hacerlo, y solo si el paquete está en Pendiente o Asignado.
 *
 * Errores del backend (`{ code, message, status }`): 404 `PAQUETE_NO_ENCONTRADO`, 409 `PAQUETE_DESPACHADO` o
 * `PAQUETE_ENTREGADO` y 403 `ACCESS_DENIED` o `ACCESO_DENEGADO`. El 401 lo atiende el interceptor de `axiosClient`.
 * @param {string} shipmentNumber Número de envío del paquete.
 * @returns {Promise<{ message: string }>} La confirmación del backend.
 */
export const deletePackage = async (shipmentNumber) => {
  const response = await axiosClient.delete(`${PACKAGES_PATH}/${encodeURIComponent(shipmentNumber)}`);
  return response.data;
};
