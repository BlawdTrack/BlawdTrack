/**
 * Da formato de reloj (M:SS) a una cantidad de segundos, para las cuentas regresivas.
 * @param {number} totalSeconds
 * @returns {string} Por ejemplo `125` → `"2:05"`.
 */
export function formatClock(totalSeconds) {
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
}
