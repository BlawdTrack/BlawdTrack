import axiosClient from '../api/axiosClient';

const ADMINISTRATORS_PATH = '/v1/administradores';

const normalizeAdministrator = (administrator) => {
  if (!administrator || administrator.id === undefined || administrator.id === null) {
    throw new Error('La respuesta del backend contiene un administrador sin identificador.');
  }

  const name = administrator.name ?? administrator.fullName;

  if (!name || !administrator.email) {
    throw new Error('La respuesta del backend contiene datos incompletos del administrador.');
  }

  return {
    ...administrator,
    id: administrator.id,
    name,
    email: administrator.email,
    identification: administrator.identification ?? administrator.nationalId ?? ''
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

export const deleteAdministrator = async (administratorId) => {
  if (administratorId === undefined || administratorId === null) {
    throw new Error('Se requiere el identificador del administrador.');
  }

  await axiosClient.delete(`${ADMINISTRATORS_PATH}/${encodeURIComponent(administratorId)}`);
};
