import { describe, expect, it } from 'vitest';
import { getInitials, getRequestError, sameSet } from './roleAccess';

describe('roleAccess', () => {
  it('compara conjuntos sin importar el orden', () => {
    expect(sameSet(new Set(['a', 'b']), new Set(['b', 'a']))).toBe(true);
    expect(sameSet(new Set(['a']), new Set(['a', 'b']))).toBe(false);
  });

  it('saca hasta dos iniciales en mayúscula', () => {
    expect(getInitials('maría del solano')).toBe('MD');
  });

  it('traduce los errores de la API', () => {
    expect(getRequestError({ response: { status: 404, data: {} } }, 'x')).toBe('Usuario no existente');
    expect(getRequestError({ response: { status: 401 } }, 'x')).toMatch(/sesión expiró/);
    expect(getRequestError({ message: 'boom' }, 'x')).toBe('boom');
  });
});
