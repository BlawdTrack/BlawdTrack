import axiosClient from '../api/axiosClient';

/**
 * Envía el archivo de paquetes (Zoho Inventory, .xlsx o .csv) para validarlo sin registrarlo:
 * `POST /api/v1/packages/import/preview` (multipart, parte `file`).
 * @param {File} file Archivo seleccionado por el usuario.
 * @returns {Promise<object>} `PackageImportPreviewResponse`: nombre del archivo, totales, registros válidos e
 *   inválidos y los duplicados detectados.
 */
export const previewPackageImport = async (file) => {
  const response = await axiosClient.postForm('/v1/packages/import/preview', { file });
  return response.data;
};

/**
 * Confirma la importación: el backend vuelve a leer el archivo y registra los paquetes válidos:
 * `POST /api/v1/packages/import` (multipart, parte `file`). Los inválidos y los duplicados se excluyen.
 * @param {File} file El mismo archivo que se previsualizó.
 * @returns {Promise<object>} `PackageImportExecutionResponse`: totales, cantidad registrada y sus números de envío.
 */
export const confirmPackageImport = async (file) => {
  const response = await axiosClient.postForm('/v1/packages/import', { file });
  return response.data;
};
