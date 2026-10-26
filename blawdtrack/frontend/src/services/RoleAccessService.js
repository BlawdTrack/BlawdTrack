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

const userPermissionsPath = (documentType, documentNumber) => (
  `/v1/users/${encodeURIComponent(documentType)}/${encodeURIComponent(documentNumber)}/permissions`
);

// Matriz de permisos de un usuario: rol, efectivos, predeterminados del rol y alcance editable.
export const getUserPermissions = async (documentType, documentNumber) => {
  const response = await axiosClient.get(userPermissionsPath(documentType, documentNumber));
  return response.data;
};

// permissionCodes es el conjunto deseado de permisos efectivos del usuario.
export const replaceUserPermissions = async (documentType, documentNumber, permissionCodes) => {
  const response = await axiosClient.put(
    userPermissionsPath(documentType, documentNumber),
    { permissionCodes }
  );
  return response.data;
};

// Elimina las excepciones del usuario: vuelve a los permisos predeterminados de su rol.
export const resetUserPermissions = async (documentType, documentNumber) => {
  const response = await axiosClient.delete(userPermissionsPath(documentType, documentNumber));
  return response.data;
};
