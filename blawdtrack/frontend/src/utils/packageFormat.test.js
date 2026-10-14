import { describe, expect, it } from 'vitest';
import { DEFAULT_PACKAGE_STATUS_KEY } from '../config/packageStatus';
import { displayValue, formatPackageSchedule, normalizeStatusKey } from './packageFormat';

describe('packageFormat', () => {
  it('normalizes status keys consistently', () => {
    expect(normalizeStatusKey('entregado')).toBe('ENTREGADO');
    expect(normalizeStatusKey('En tránsito')).toBe('EN_TRANSITO');
    expect(normalizeStatusKey('enviado')).toBe('ENVIADO');
    expect(normalizeStatusKey('  asignado  ')).toBe('ASIGNADO');
    expect(normalizeStatusKey(null)).toBe(DEFAULT_PACKAGE_STATUS_KEY);
  });

  it('formats schedules removing the leading zero and lowercasing am/pm', () => {
    expect(formatPackageSchedule('08:00 AM - 12:00 PM')).toBe('8:00 am - 12:00 pm');
    expect(formatPackageSchedule('09:30 PM')).toBe('9:30 pm');
    expect(formatPackageSchedule('08:00 AM - 12:00 PM - 03:15 PM')).toBe('8:00 am - 12:00 pm - 3:15 pm');
    expect(formatPackageSchedule(null)).toBe('');
  });

  it('displays placeholder values for null or blank content', () => {
    expect(displayValue(null)).toBe('—');
    expect(displayValue('')).toBe('—');
    expect(displayValue('  ')).toBe('—');
    expect(displayValue('Heredia')).toBe('Heredia');
  });
});
