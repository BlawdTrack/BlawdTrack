import axiosClient from '../api/axiosClient';

export const registerCourier = async (courierData) => {
  const response = await axiosClient.post('/v1/couriers', courierData);
  return response.data;
};

export const listCouriers = async () => {
  const response = await axiosClient.get('/v1/couriers');
  return response.data;
};

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

export const deactivateCourier = async (id) => {
  const response = await axiosClient.patch(
    `/v1/couriers/${encodeURIComponent(id)}/deactivate`
  );
  return response.data;
};

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