import { describe, it, expect } from 'vitest';
import { evaluatePasswordRules, meetsClientPasswordRules, MIN_PASSWORD_LENGTH } from './passwordRules';

describe('passwordRules (HU-002 T05)', () => {
  it('evalúa cada regla por separado', () => {
    expect(evaluatePasswordRules('abc')).toEqual({ length: false, uppercase: false, number: false });
    expect(evaluatePasswordRules('Abcdefgh')).toEqual({ length: true, uppercase: true, number: false });
    expect(evaluatePasswordRules('abcdefg1')).toEqual({ length: true, uppercase: false, number: true });
  });

  it('exige el largo mínimo exacto', () => {
    expect(MIN_PASSWORD_LENGTH).toBe(8);
    expect(evaluatePasswordRules('Abcdef1').length).toBe(false);
    expect(evaluatePasswordRules('Abcdefg1').length).toBe(true);
  });

  it('acepta mayúsculas con tilde y ñ', () => {
    expect(evaluatePasswordRules('Ñandú123x').uppercase).toBe(true);
    expect(evaluatePasswordRules('ábcdefg1').uppercase).toBe(false);
  });

  it('meetsClientPasswordRules solo es true si cumple las 3 reglas', () => {
    expect(meetsClientPasswordRules('Abcdefg1')).toBe(true);
    expect(meetsClientPasswordRules('abcdefg1')).toBe(false);
    expect(meetsClientPasswordRules('Abcdefgh')).toBe(false);
    expect(meetsClientPasswordRules('Ab1')).toBe(false);
    expect(meetsClientPasswordRules('')).toBe(false);
  });
});
