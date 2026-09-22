import axiosClient from '../api/axiosClient';

export const listCouriers = async () => {
  const response = await axiosClient.get('/v1/couriers');
  return response.data;
};

export const deactivateCourier = async (nationalId) => {
  const response = await axiosClient.patch(
    `/v1/couriers/${encodeURIComponent(nationalId)}/deactivate`
  );
  return response.data;
};
