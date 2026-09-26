import axiosClient from '../api/axiosClient';

export const registerCourier = async (courierData) => {
  try {
    const response = await axiosClient.post('/v1/couriers', courierData);
    
    // Retornamos la respuesta del backend, pero garantizamos que incluya
    // 'success: true' para que el componente dispare la alerta de éxito
    // en caso de que tu API no envíe esta bandera por defecto.
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error('Error al registrar mensajero:', error);
    throw error; // Lanza el error para que el catch del componente lo atrape
  }
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