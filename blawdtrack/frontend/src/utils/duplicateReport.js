/** Causas de duplicado que devuelve el backend (`DuplicateShipmentNumberReason`). */
export const DUPLICATE_REASONS = Object.freeze({
  ALREADY_REGISTERED: 'ALREADY_REGISTERED',
  DUPLICATED_IN_FILE: 'DUPLICATED_IN_FILE',
});

/**
 * Nota que explica por qué un número de envío es duplicado, tal como la muestra la previsualización.
 * @param {{ reasons?: string[], occurrences?: number }} duplicate Duplicado de la respuesta de previsualización.
 * @returns {string}
 */
export function describeDuplicate({ reasons = [], occurrences = 1 }) {
  const notes = [];
  if (reasons.includes(DUPLICATE_REASONS.ALREADY_REGISTERED)) {
    notes.push('Ya registrado en la base de datos');
  }
  if (reasons.includes(DUPLICATE_REASONS.DUPLICATED_IN_FILE)) {
    notes.push(occurrences > 1 ? `Repetido ${occurrences} veces en el archivo` : 'Repetido en el archivo');
  }
  return notes.join(' · ');
}

const countOf = (value) => (Number.isFinite(value) ? value : 0);

/**
 * Convierte la respuesta de previsualización de una importación (`PackageImportPreviewResponse`) en lo que
 * muestra la pantalla de duplicados: los totales y una fila por número de envío duplicado.
 *
 * Los contadores de causa son excluyentes, igual que en el backend: un número ya registrado cuenta solo como
 * "ya registrado", aunque además esté repetido en el archivo. `customerName` y `address` de cada duplicado son
 * opcionales; si el backend no los envía, la fila solo muestra el número y la nota.
 * @param {object|null|undefined} preview Respuesta de previsualización.
 * @returns {{ fileName: string, totalRecords: number, validCount: number, duplicateCount: number,
 *   alreadyRegisteredCount: number, duplicatedInFileCount: number,
 *   duplicates: Array<{ shipmentNumber: string, customerName: string|null, address: string|null, note: string }> }|null}
 *   `null` si no hay una previsualización utilizable.
 */
export function buildDuplicateReport(preview) {
  if (!preview || typeof preview !== 'object') return null;

  const duplicates = Array.isArray(preview.duplicates) ? preview.duplicates : [];
  const alreadyRegisteredCount = duplicates.filter((item) =>
    item.reasons?.includes(DUPLICATE_REASONS.ALREADY_REGISTERED)
  ).length;
  const duplicatedInFileCount = duplicates.filter(
    (item) =>
      !item.reasons?.includes(DUPLICATE_REASONS.ALREADY_REGISTERED) &&
      item.reasons?.includes(DUPLICATE_REASONS.DUPLICATED_IN_FILE)
  ).length;
  const validCount = countOf(preview.validRecordsCount);

  return {
    fileName: preview.fileName ?? '',
    totalRecords: countOf(preview.totalRecords) || validCount + duplicates.length + countOf(preview.invalidRecordsCount),
    validCount,
    duplicateCount: duplicates.length,
    alreadyRegisteredCount,
    duplicatedInFileCount,
    duplicates: duplicates.map((item) => ({
      shipmentNumber: item.shipmentNumber,
      customerName: item.customerName ?? null,
      address: item.address ?? null,
      note: describeDuplicate(item),
    })),
  };
}
