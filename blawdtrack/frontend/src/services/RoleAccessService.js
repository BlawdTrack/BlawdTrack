import axiosClient from '../api/axiosClient';

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
