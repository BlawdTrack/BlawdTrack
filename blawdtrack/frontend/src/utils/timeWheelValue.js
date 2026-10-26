/** Valores de las ruedas del selector de hora y su conversión desde y hacia el texto "HH:MM" de 24 horas. */
export const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
export const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
export const PERIODS = ['am', 'pm'];

// "HH:MM" (24h) <-> wheel selection (12h + am/pm)
export function parse(value) {
  if (!value) return { hour: '08', minute: '00', period: 'am' };
  const [h, m] = value.split(':').map(Number);
  return {
    hour: String(h % 12 || 12).padStart(2, '0'),
    minute: String(m).padStart(2, '0'),
    period: h >= 12 ? 'pm' : 'am'
  };
}

export function toValue({ hour, minute, period }) {
  const h = (Number(hour) % 12) + (period === 'pm' ? 12 : 0);
  return `${String(h).padStart(2, '0')}:${minute}`;
}

export function display(value) {
  if (!value) return '';
  const { hour, minute, period } = parse(value);
  return `${Number(hour)}:${minute} ${period}`;
}
