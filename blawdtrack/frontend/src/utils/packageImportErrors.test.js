import { describe, it, expect } from 'vitest';
import { normalizePackageImportError } from './packageImportErrors';

const httpError = (status, data) => ({ response: { status, data } });

describe('normalizePackageImportError', () => {
  it('muestra tal cual el mensaje del backend cuando el archivo no es válido', () => {
    const result = normalizePackageImportError(
      httpError(400, { code: 'INVALID_PACKAGE_FILE', message: 'Formato no compatible. Solo se permiten archivos .xlsx, .csv' })
    );

    expect(result).toMatchObject({
      kind: 'validation',
      severity: 'error',
      globalMessage: 'Formato no compatible. Solo se permiten archivos .xlsx, .csv',
    });
  });

  it('usa un mensaje propio si el backend no explica qué tiene mal el archivo', () => {
    const result = normalizePackageImportError(httpError(400, { code: 'INVALID_PACKAGE_FILE' }));

    expect(result.globalMessage).toMatch(/El archivo no es válido/);
  });

  it('explica que el archivo es demasiado grande en un 413', () => {
    const result = normalizePackageImportError(httpError(413, {}));

    expect(result).toMatchObject({ kind: 'validation' });
    expect(result.globalMessage).toMatch(/demasiado grande/);
  });

  it('un 400 sin el código del archivo cae en el mensaje general de lectura', () => {
    const result = normalizePackageImportError(httpError(400, { code: 'VALIDATION_ERROR', errores: [] }));

    expect(result.kind).toBe('validation');
    expect(result.globalMessage).toMatch(/No se pudo leer el archivo/);
  });

  it('distingue sesión vencida, falta de permiso, servidor y red', () => {
    expect(normalizePackageImportError(httpError(401, {}))).toMatchObject({ kind: 'unauthenticated', severity: 'warning' });
    expect(normalizePackageImportError(httpError(403, {})).globalMessage).toBe('No tienes permiso para importar paquetes.');
    expect(normalizePackageImportError(httpError(500, {})).kind).toBe('server');
    expect(normalizePackageImportError(new Error('Network Error')).kind).toBe('network');
  });

  it('un estado inesperado usa el mensaje de respaldo', () => {
    expect(normalizePackageImportError(httpError(418, {}))).toMatchObject({
      kind: 'unknown',
      globalMessage: 'No se pudo cargar el archivo. Intenta de nuevo.',
    });
  });

  it('no inventa errores de campo', () => {
    expect(normalizePackageImportError(httpError(400, { code: 'INVALID_PACKAGE_FILE', message: 'x' })).fieldErrors).toEqual({});
  });
});
