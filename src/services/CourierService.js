import axiosClient from '@/api/axiosClient';

export const registrarMensajero = async (datosMensajero) => {
  const response = await axiosClient.post('/mensajeros', datosMensajero);
  return response.data;
};

