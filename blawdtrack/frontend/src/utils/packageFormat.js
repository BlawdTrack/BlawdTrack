import { DEFAULT_PACKAGE_STATUS_KEY, PACKAGE_STATUS_ALIASES } from '../config/packageStatus';

/**
 * Normaliza la clave de estado para que siempre coincida con el mapa de estilos del componente.
 * @param {string|null|undefined} status
 * @returns {string}
 */
export function normalizeStatusKey(status) {
  const rawValue = typeof status === 'string' ? status.trim() : '';

  if (!rawValue) {
    return DEFAULT_PACKAGE_STATUS_KEY;
  }

  const lettersOnly = rawValue
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s-]+/g, '_')
    .toUpperCase();

  const key = lettersOnly.replace(/[^A-Z0-9_]/g, '') || DEFAULT_PACKAGE_STATUS_KEY;
  return PACKAGE_STATUS_ALIASES[key] ?? key;
}

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
