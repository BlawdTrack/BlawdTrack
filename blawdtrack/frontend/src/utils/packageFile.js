/** Extensiones que acepta la importación de paquetes (el parser del backend solo lee estos formatos). */
export const PACKAGE_FILE_EXTENSIONS = ['.xlsx', '.csv'];

/** Valor del atributo `accept` del selector de archivo. */
export const PACKAGE_FILE_ACCEPT = PACKAGE_FILE_EXTENSIONS.join(',');

/** Los formatos como se muestran al usuario: ".xlsx y .csv". */
export const PACKAGE_FILE_FORMATS_LABEL = PACKAGE_FILE_EXTENSIONS.join(' y ');

const extensionOf = (fileName = '') => {
  const dot = fileName.lastIndexOf('.');
  return dot < 0 ? '' : fileName.slice(dot).toLowerCase();
};

/**
 * Validación básica del archivo en el navegador, antes de enviarlo: que haya uno, que sea de un formato
 * admitido y que no esté vacío. El contenido (columnas, campos obligatorios) lo valida el backend.
 * @param {File|null|undefined} file
 * @returns {string|null} El mensaje de error, o `null` si el archivo es utilizable.
 */
export function validatePackageFile(file) {
  if (!file) return 'Selecciona un archivo para continuar.';
  if (!PACKAGE_FILE_EXTENSIONS.includes(extensionOf(file.name))) {
    return `Formato no compatible. Solo se permiten archivos ${PACKAGE_FILE_FORMATS_LABEL}.`;
  }
  if (file.size === 0) return 'El archivo está vacío. Selecciona otro archivo.';
  return null;
}

/**
 * Tamaño legible de un archivo ("850 B", "12,5 KB", "1,2 MB").
 * @param {number} bytes
 */
export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  const format = (value) => value.toFixed(1).replace('.', ',').replace(/,0$/, '');
  if (bytes < 1024 * 1024) return `${format(bytes / 1024)} KB`;
  return `${format(bytes / (1024 * 1024))} MB`;
}
