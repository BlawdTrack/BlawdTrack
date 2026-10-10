/**
 * Saludo según la hora local: "Buenos días" de 5:00 a 11:59, "Buenas tardes" de 12:00 a 18:59 y
 * "Buenas noches" el resto del día.
 * @param {Date} [now] Momento a evaluar (por defecto, ahora).
 * @returns {string}
 */
export function getGreeting(now = new Date()) {
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) return 'Buenos días';
  if (hour >= 12 && hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
