import { describe, it, expect } from 'vitest';
import { evaluatePasswordRules, meetsClientPasswordRules, MIN_PASSWORD_LENGTH } from './passwordRules';

describe('passwordRules (HU-002 T05)', () => {
  it('evalúa cada regla por separado', () => {
    expect(evaluatePasswordRules('123')).toEqual({ length: false, letter: false, number: true });
    expect(evaluatePasswordRules('Abcdefgh')).toEqual({ length: true, letter: true, number: false });
    expect(evaluatePasswordRules('12345678')).toEqual({ length: true, letter: false, number: true });
  });

  it('exige el largo mínimo exacto', () => {
    expect(MIN_PASSWORD_LENGTH).toBe(8);
    expect(evaluatePasswordRules('abcdef1').length).toBe(false);
    expect(evaluatePasswordRules('abcdefg1').length).toBe(true);
  });

  it('no exige mayúscula: basta con letras y números', () => {
    expect(evaluatePasswordRules('abcdefg1').letter).toBe(true);
  });

  it('meetsClientPasswordRules solo es true si cumple las 3 reglas', () => {
    expect(meetsClientPasswordRules('abcdefg1')).toBe(true);
    expect(meetsClientPasswordRules('Abcdefg1')).toBe(true);
    expect(meetsClientPasswordRules('12345678')).toBe(false);
    expect(meetsClientPasswordRules('Abcdefgh')).toBe(false);
    expect(meetsClientPasswordRules('Ab1')).toBe(false);
    expect(meetsClientPasswordRules('')).toBe(false);
  });
});
