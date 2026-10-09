import axiosClient from '../api/axiosClient';

/**
 * Registra un mensajero: `POST /api/v1/couriers`.
 * @param {object} courierData Cuerpo de `CreateCourierRequest`.
 */
export const registerCourier = async (courierData) => {
  const response = await axiosClient.post('/v1/couriers', courierData);
  return response.data;
};

/** Lista todos los mensajeros: `GET /api/v1/couriers`. */
export const listCouriers = async () => {
  const response = await axiosClient.get('/v1/couriers');
  return response.data;
};

/**
 * Busca un mensajero por número de documento entre la lista completa (compara solo los dígitos).
 * @param {string} documentNumber
 * @returns {Promise<object|null>} El mensajero, o `null` si no existe.
 * @throws {Error} Si el número no tiene dígitos o la respuesta del backend es incompleta.
 */
export const findCourierByDocumentNumber = async (documentNumber) => {
  const normalizedDocument = documentNumber.replace(/\D/g, '');
  if (!normalizedDocument) {
    throw new Error('Ingresa una cédula válida para realizar la búsqueda.');
  }

  const couriers = await listCouriers();
  if (!Array.isArray(couriers)) {
    throw new Error('La respuesta del backend no contiene una lista de mensajeros.');
  }

  const courier = couriers.find((candidate) => (
    String(candidate.documentNumber ?? '').replace(/\D/g, '') === normalizedDocument
  ));

  if (!courier) return null;
  if (!courier.id || !courier.fullName || !courier.documentNumber) {
    throw new Error('La respuesta del backend contiene datos incompletos del mensajero.');
  }

  return courier;
};

/**
 * Desactiva un mensajero: `PATCH /api/v1/couriers/{id}/deactivate`.
 * @param {number|string} id Id del mensajero.
 */
export const deactivateCourier = async (id) => {
  const response = await axiosClient.patch(
    `/v1/couriers/${encodeURIComponent(id)}/deactivate`
  );
  return response.data;
};

/**
 * Actualiza un mensajero: `PUT /api/v1/couriers/{id}`.
 * @param {string|number} idCard Id numérico del mensajero o su número de documento.
 * @param {object} courierData Cuerpo de `UpdateCourierRequest`.
 */
export const updateCourier = async (idCard, courierData) => {
  try {
    const response = await axiosClient.put(
      `/v1/couriers/${encodeURIComponent(idCard)}`,
      courierData
    );
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error('Error al actualizar mensajero:', error);
    throw error;
  }
};

/** Consulta un mensajero: `GET /api/v1/couriers/{documentNumber}`. */
export const updateCourierStatus = async (id, status) => {
  const response = await axiosClient.patch(
    `/v1/couriers/${encodeURIComponent(id)}/status`,
    { status }
  );
  return response.data;
};

export const updateCourierPassword = async (id, password) => {
  await axiosClient.patch(
    `/v1/couriers/${encodeURIComponent(id)}/password`,
    { password }
  );
};

/**
 * Auditoría de todas las desactivaciones (`GET /api/v1/couriers/deactivations`), de la más reciente a la
 * más antigua. Se conserva aunque el mensajero se haya reactivado.
 */
export const getCourierDeactivations = async () => {
  const response = await axiosClient.get('/v1/couriers/deactivations');
  return response.data;
};

export const getCourierHistory = async (id) => {
  const response = await axiosClient.get(
    `/v1/couriers/${encodeURIComponent(id)}/history`
  );
  return response.data;
};

export const getCourierByDocumentNumber = async (documentNumber) => {
  try {
    const response = await axiosClient.get(
      `/v1/couriers/${encodeURIComponent(documentNumber)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener mensajero:', error);
    throw error;
  }
};