import { describe, expect, it } from 'vitest';
import { validateEmail } from './emailRules';

describe('validateEmail', () => {
  it('acepta un correo con formato válido, aunque traiga espacios alrededor', () => {
    expect(validateEmail('nombre@blawdgourmet.com')).toBe('');
    expect(validateEmail('  nombre@blawdgourmet.com  ')).toBe('');
  });

  it('exige el correo, sin contar los espacios', () => {
    expect(validateEmail('')).toBe('El correo electrónico es obligatorio.');
    expect(validateEmail('   ')).toBe('El correo electrónico es obligatorio.');
  });

  it('rechaza lo que no tiene formato de correo', () => {
    const message = 'Ingresa un correo electrónico con un formato válido.';

    expect(validateEmail('nombre')).toBe(message);
    expect(validateEmail('nombre@')).toBe(message);
    expect(validateEmail('nombre@dominio')).toBe(message);
    expect(validateEmail('nom bre@dominio.com')).toBe(message);
  });
});
