import { describe, expect, it } from 'vitest';
import { display, HOURS, MINUTES, parse, PERIODS, toValue } from './timeWheelValue';

describe('valores de las ruedas', () => {
  it('las horas van de 01 a 12, los minutos de 00 a 59 y el periodo es am o pm', () => {
    expect(HOURS).toHaveLength(12);
    expect(HOURS[0]).toBe('01');
    expect(HOURS[11]).toBe('12');
    expect(MINUTES).toHaveLength(60);
    expect(MINUTES[0]).toBe('00');
    expect(MINUTES[59]).toBe('59');
    expect(PERIODS).toEqual(['am', 'pm']);
  });
});

describe('parse', () => {
  it('sin valor propone las 08:00 am', () => {
    expect(parse('')).toEqual({ hour: '08', minute: '00', period: 'am' });
  });

  it('convierte de 24 horas a 12 horas con am o pm', () => {
    expect(parse('08:30')).toEqual({ hour: '08', minute: '30', period: 'am' });
    expect(parse('13:05')).toEqual({ hour: '01', minute: '05', period: 'pm' });
    expect(parse('00:00')).toEqual({ hour: '12', minute: '00', period: 'am' });
    expect(parse('12:00')).toEqual({ hour: '12', minute: '00', period: 'pm' });
  });
});

describe('toValue', () => {
  it('convierte la selección de las ruedas al texto de 24 horas', () => {
    expect(toValue({ hour: '08', minute: '30', period: 'am' })).toBe('08:30');
    expect(toValue({ hour: '01', minute: '05', period: 'pm' })).toBe('13:05');
    expect(toValue({ hour: '12', minute: '00', period: 'am' })).toBe('00:00');
    expect(toValue({ hour: '12', minute: '00', period: 'pm' })).toBe('12:00');
  });

  it('es la inversa de parse para cualquier hora del día', () => {
    for (let hour = 0; hour < 24; hour += 1) {
      const value = `${String(hour).padStart(2, '0')}:15`;
      expect(toValue(parse(value))).toBe(value);
    }
  });
});

describe('display', () => {
  it('muestra la hora en 12 horas sin cero a la izquierda', () => {
    expect(display('08:30')).toBe('8:30 am');
    expect(display('15:45')).toBe('3:45 pm');
  });

  it('sin valor no muestra nada', () => {
    expect(display('')).toBe('');
  });
});
