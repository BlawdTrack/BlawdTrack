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
