import axiosClient from '../api/axiosClient';

/**
 * Reemplaza los permisos de un rol: `PUT /api/v1/roles/{roleId}/permissions`.
 * @param {number} roleId Id numérico del rol.
 * @param {number[]} permissionIds Ids numéricos de los permisos que el rol tendrá.
 */
export const replaceRolePermissions = async (roleId, permissionIds) => {
  const response = await axiosClient.put(
    `/v1/roles/${encodeURIComponent(roleId)}/permissions`,
    { permissionIds }
  );
  return response.data;
};
