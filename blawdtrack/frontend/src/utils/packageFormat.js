/**
 * Formatea el horario para mostrarlo de manera legible y uniforme en la tabla.
 * @param {string|null|undefined} schedule
 * @returns {string}
 */
export function formatPackageSchedule(schedule) {
  if (schedule === null || schedule === undefined) {
    return '';
  }

  return String(schedule).replace(/\b0?(\d{1,2}:\d{2})\s*(AM|PM)\b/gi, (_, time, period) => `${time} ${period.toLowerCase()}`);
}

/**
 * Devuelve un valor de presentación amigable para celdas vacías o nulas.
 * @param {*} value
 * @returns {string}
 */
export function displayValue(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return '—';
  }

  return value;
}
