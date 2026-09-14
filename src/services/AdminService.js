import axiosClient from '@/api/axiosClient';

export const registrarAdministrador = async (datosAdministrador) => {
  const response = await axiosClient.post(
    '/administradores',
    datosAdministrador
  );

  return response.data;
};