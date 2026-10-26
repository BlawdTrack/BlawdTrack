import { describe, it, expect } from 'vitest';
import { composeSchedule, formatTime, parseSchedule } from './courierSchedule';

describe('courierSchedule', () => {
  it('formatTime convierte 24 h a 12 h con am/pm', () => {
    expect(formatTime('06:00')).toBe('6:00 am');
    expect(formatTime('14:30')).toBe('2:30 pm');
    expect(formatTime('00:05')).toBe('12:05 am');
    expect(formatTime('12:00')).toBe('12:00 pm');
  });

  it('composeSchedule devuelve vacío si falta alguna hora', () => {
    expect(composeSchedule('06:00', '')).toBe('');
    expect(composeSchedule('', '14:00')).toBe('');
    expect(composeSchedule('06:00', '14:00')).toBe('6:00 am – 2:00 pm');
  });

  it('parseSchedule es la inversa de composeSchedule', () => {
    expect(parseSchedule('6:00 am – 2:00 pm')).toEqual({ start: '06:00', end: '14:00' });
    expect(parseSchedule('12:00 am – 12:30 pm')).toEqual({ start: '00:00', end: '12:30' });
    expect(parseSchedule(composeSchedule('08:15', '16:45'))).toEqual({ start: '08:15', end: '16:45' });
  });

  it('parseSchedule tolera texto extra y guion simple', () => {
    expect(parseSchedule('Lun-Vie, 7:00 am - 3:00 pm')).toEqual({ start: '07:00', end: '15:00' });
  });

  it('parseSchedule devuelve vacío si el formato no se reconoce', () => {
    expect(parseSchedule('')).toEqual({ start: '', end: '' });
    expect(parseSchedule(null)).toEqual({ start: '', end: '' });
    expect(parseSchedule('mañanas')).toEqual({ start: '', end: '' });
  });
});
