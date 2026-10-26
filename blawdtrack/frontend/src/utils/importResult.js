const countOf = (value) => (Number.isFinite(value) ? value : 0);

/**
 * Convierte la respuesta de confirmar una importación (`PackageImportExecutionResponse`) en lo que muestra la
 * pantalla del resultado: los totales y los números de envío registrados.
 * @param {object|null|undefined} response Respuesta de `POST /api/v1/packages/import`.
 * @returns {{ fileName: string, counts: { read: number, registered: number, invalid: number, duplicate: number },
 *   registeredShipmentNumbers: string[] }|null} `null` si no hay una respuesta utilizable.
 */
export function buildImportResult(response) {
  if (!response || typeof response !== 'object') return null;

  const registeredShipmentNumbers = Array.isArray(response.registeredShipmentNumbers) ? response.registeredShipmentNumbers : [];

  return {
    fileName: response.fileName ?? '',
    counts: {
      read: countOf(response.totalRecords),
      registered: countOf(response.registeredRecordsCount) || registeredShipmentNumbers.length,
      invalid: countOf(response.invalidRecordsCount),
      duplicate: countOf(response.duplicateRecordsCount),
    },
    registeredShipmentNumbers,
  };
}

const plural = (count, singular, pluralForm) => `${count} ${count === 1 ? singular : pluralForm}`;

/**
 * Aviso que se muestra en "Consultar paquetes" cuando termina la importación: cuántos paquetes se registraron, o una
 * advertencia si el archivo no tenía registros válidos.
 * @param {{ fileName: string, counts: { registered: number } }} result Resultado de `buildImportResult`.
 * @returns {{ message: string, severity: 'success'|'warning' }}
 */
export function importResultNotice({ fileName, counts }) {
  const inFile = fileName ? ` de ${fileName}` : '';
  if (counts.registered > 0) {
    return {
      message: `${plural(counts.registered, 'paquete registrado', 'paquetes registrados')}${inFile}. Los registros con errores y los duplicados se excluyeron.`,
      severity: 'success',
    };
  }
  return { message: `No se registró ningún paquete: el archivo${fileName ? ` ${fileName}` : ''} no tenía registros válidos.`, severity: 'warning' };
}
