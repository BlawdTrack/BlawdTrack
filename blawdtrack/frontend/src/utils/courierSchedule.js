// Conversión entre las horas de las ruedas (24 h, "HH:MM") y el texto de horario que guarda el
// backend ("6:00 am – 2:00 pm"), compartida por las pantallas de crear y editar mensajero.

const TIME_RANGE = /(\d{1,2}):(\d{2})\s*(am|pm)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(am|pm)/i;

/**
 * "HH:MM" (24 h) -> "6:00 am".
 * @param {string} value Hora en formato 24 h.
 * @returns {string}
 */
export function formatTime(value) {
  const [h, m] = value.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/**
 * Arma el texto de horario a partir de las dos horas de las ruedas.
 * @param {string} start Hora de entrada "HH:MM" (24 h) o vacío.
 * @param {string} end Hora de salida "HH:MM" (24 h) o vacío.
 * @returns {string} "6:00 am – 2:00 pm", o vacío si falta alguna hora.
 */
export function composeSchedule(start, end) {
  return start && end ? `${formatTime(start)} – ${formatTime(end)}` : '';
}

function to24Hour(hour, minute, period) {
  const h = (Number(hour) % 12) + (period.toLowerCase() === 'pm' ? 12 : 0);
  return `${String(h).padStart(2, '0')}:${minute}`;
}

/**
 * Extrae las horas de entrada y salida de un horario guardado.
 * @param {string} schedule Texto como "6:00 am – 2:00 pm" (puede traer texto extra, p. ej. los días).
 * @returns {{ start: string, end: string }} Horas "HH:MM" (24 h); vacías si el texto no tiene el formato esperado.
 */
export function parseSchedule(schedule) {
  const match = TIME_RANGE.exec(schedule ?? '');
  if (!match) return { start: '', end: '' };
  const [, h1, m1, p1, h2, m2, p2] = match;
  return { start: to24Hour(h1, m1, p1), end: to24Hour(h2, m2, p2) };
}
