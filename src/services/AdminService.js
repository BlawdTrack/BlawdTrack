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
    documentNumber,
    identification: documentNumber
  };
};

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

export const deleteAdministrator = async (cedula) => {
  await axiosClient.delete(
    `${ADMINISTRATORS_PATH}/${encodeURIComponent(cedula)}`
  );
};