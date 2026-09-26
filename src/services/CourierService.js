import axiosClient from '../api/axiosClient';

export const registerCourier = async (courierData) => {
  const response = await axiosClient.post('/v1/couriers', courierData);
  return response.data;
};

export const listCouriers = async () => {
  const response = await axiosClient.get('/v1/couriers');
  return response.data;
};

export const deactivateCourier = async (id) => {
  const response = await axiosClient.patch(
    `/v1/couriers/${encodeURIComponent(id)}/deactivate`
  );
  return response.data;
};