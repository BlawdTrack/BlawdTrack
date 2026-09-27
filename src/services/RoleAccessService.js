import axiosClient from '../api/axiosClient';

export const replaceRolePermissions = async (roleId, permissionIds) => {
  const response = await axiosClient.put(
    `/v1/roles/${encodeURIComponent(roleId)}/permissions`,
    { permissionIds }
  );
  return response.data;
};
