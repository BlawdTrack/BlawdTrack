import axiosClient from '../api/axiosClient';

export const registerCourier = async (courierData) => {
  try {
    const response = await axiosClient.post('/couriers', courierData);
    
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