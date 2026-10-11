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
 * Cuenta las causas de duplicado de la previsualización de una importación. Las causas son excluyentes, igual
 * que en el backend: un número ya registrado cuenta solo como "ya registrado", aunque además esté repetido en el
 * archivo.
 * @param {Array<{ reasons?: string[] }>} duplicates Duplicados de `PackageImportPreviewResponse`.
 * @returns {{ alreadyRegistered: number, duplicatedInFile: number }}
 */
export function countDuplicateCauses(duplicates = []) {
  const alreadyRegistered = duplicates.filter((item) => item?.reasons?.includes(DUPLICATE_REASONS.ALREADY_REGISTERED)).length;
  const duplicatedInFile = duplicates.filter(
    (item) =>
      !item?.reasons?.includes(DUPLICATE_REASONS.ALREADY_REGISTERED) && item?.reasons?.includes(DUPLICATE_REASONS.DUPLICATED_IN_FILE)
  ).length;
  return { alreadyRegistered, duplicatedInFile };
}
