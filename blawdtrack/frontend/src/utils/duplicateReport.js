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

/**
 * Filas del archivo que excluye un duplicado. El backend agrupa por número de envío y `occurrences` es la cantidad
 * de filas del archivo con ese número (todas se excluyen); si no llega, se asume una.
 * @param {{ occurrences?: number }|null|undefined} duplicate Duplicado de `PackageImportPreviewResponse`.
 * @returns {number}
 */
export function duplicateRowCount(duplicate) {
  return Number.isInteger(duplicate?.occurrences) && duplicate.occurrences > 0 ? duplicate.occurrences : 1;
}

/**
 * Cuenta las **filas** duplicadas por causa. Las causas son excluyentes, igual que los contadores de la comparación
 * del backend (`alreadyRegisteredCount` y `duplicatedInFileCount`): las filas de un número ya registrado cuentan
 * solo como "ya registrado", aunque además esté repetido en el archivo. La suma de las dos es el total de filas
 * duplicadas (`duplicateRecordsCount`).
 * @param {Array<{ reasons?: string[], occurrences?: number }>} duplicates Duplicados de `PackageImportPreviewResponse`.
 * @returns {{ alreadyRegistered: number, duplicatedInFile: number }}
 */
export function countDuplicateCauses(duplicates = []) {
  const totals = { alreadyRegistered: 0, duplicatedInFile: 0 };
  duplicates.forEach((item) => {
    if (item?.reasons?.includes(DUPLICATE_REASONS.ALREADY_REGISTERED)) {
      totals.alreadyRegistered += duplicateRowCount(item);
    } else if (item?.reasons?.includes(DUPLICATE_REASONS.DUPLICATED_IN_FILE)) {
      totals.duplicatedInFile += duplicateRowCount(item);
    }
  });
  return totals;
}
