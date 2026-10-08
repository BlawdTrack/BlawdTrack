import axiosClient from '../api/axiosClient';

// Ruta base centralizada según la definición del backend
const ADMINISTRATORS_PATH = '/v1/admins';

const normalizeAdministrator = (administrator) => {
  if (!administrator || administrator.id === undefined || administrator.id === null) {
    throw new Error('La respuesta del backend contiene un administrador sin identificador.');
  }

  const name = administrator.name
    ?? administrator.fullName
    ?? administrator.nombreCompleto;
  const email = administrator.email
    ?? administrator.correoElectronico;
  const documentNumber = administrator.documentNumber
    ?? administrator.numeroDocumento
    ?? administrator.identification
    ?? administrator.nationalId
    ?? '';

  if (!name || !email) {
    throw new Error('La respuesta del backend contiene datos incompletos del administrador.');
  }

  return {
    ...administrator,
    id: administrator.id,
    name,
    email,
    documentType: administrator.documentType,
    documentNumber,
    identification: documentNumber,
    hasActiveSession: Boolean(administrator.hasActiveSession)
  };
};

/**
 * Registra un administrador de ventas: `POST /api/v1/admins`. El backend genera una contraseña temporal y la
 * envía por correo al nuevo administrador.
 * @param {{ nombreCompleto: string, numeroTelefono: string, correoElectronico: string,
 *   documentType: string, documentNumber: string }} adminData
 *   Cuerpo esperado por `AdminRegistrationRequest`.
 */
export const registerAdministrator = async (adminData) => {
  const response = await axiosClient.post(ADMINISTRATORS_PATH, adminData);
  return response.data;
};

/**
 * Lista los administradores de ventas: `GET /api/v1/admins`.
 * @returns {Promise<Array<{ id: number, name: string, email: string, documentType: string,
 *   documentNumber: string, hasActiveSession: boolean }>>}
 */
export const getAdministrators = async () => {
  const response = await axiosClient.get(ADMINISTRATORS_PATH);
  const payload = response.data;
  const administrators = Array.isArray(payload)
    ? payload
    : payload?.content;

  if (!Array.isArray(administrators)) {
    throw new Error('La respuesta del backend no contiene una lista de administradores.');
  }

  return administrators.map(normalizeAdministrator);
};

/**
 * Elimina un administrador: `DELETE /api/v1/admins/{documentType}/{documentNumber}`.
 * @param {string} documentType `CEDULA`, `DIMEX` o `PASAPORTE`.
 * @param {string} documentNumber
 */
export const deleteAdministrator = async (documentType, documentNumber) => {
  await axiosClient.delete(
    `${ADMINISTRATORS_PATH}/${encodeURIComponent(documentType)}/${encodeURIComponent(documentNumber)}`
  );
};

// GET /api/v1/admins/audit-log: historial de creación/eliminación de
// administradores (HU-006 / T06), persistido en el backend.
export const getAdminAuditLog = async () => {
  const response = await axiosClient.get(`${ADMINISTRATORS_PATH}/audit-log`);
  if (!Array.isArray(response.data)) {
    throw new Error('La respuesta del backend no contiene un historial de auditoría.');
  }
  return response.data;
};