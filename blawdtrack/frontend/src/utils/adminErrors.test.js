import { describe, it, expect } from 'vitest';
import { normalizeAdminError } from './adminErrors';

const httpError = (status, data) => ({ response: { status, data } });

describe('normalizeAdminError', () => {
  describe('400 validation', () => {
    it('maps several fields from errores[]', () => {
      const out = normalizeAdminError(
        httpError(400, {
          code: 'VALIDATION_ERROR',
          errores: [
            { campo: 'correoElectronico', mensaje: 'Email address is not in a valid format.' },
            { campo: 'contrasenaInicial', mensaje: 'Too short.' },
          ],
        })
      );
      expect(out.kind).toBe('validation');
      expect(Object.keys(out.fieldErrors).sort()).toEqual(['contrasenaInicial', 'correoElectronico']);
      expect(out.fieldErrors.contrasenaInicial).toMatch(/8 caracteres/);
      expect(out.globalMessage).toBeNull();
    });

    it('uses the backend message for an unknown field', () => {
      const out = normalizeAdminError(
        httpError(400, { code: 'VALIDATION_ERROR', errores: [{ campo: 'otro', mensaje: 'Texto del backend' }] })
      );
      expect(out.fieldErrors).toEqual({});
      expect(out.globalMessage).toBe('Texto del backend');
    });

    it('falls back to a generic alert when there are no fields', () => {
      const out = normalizeAdminError(httpError(400, { code: 'VALIDATION_ERROR' }));
      expect(out.fieldErrors).toEqual({});
      expect(out.globalMessage).toMatch(/Revisa los datos/);
    });
  });

  describe('409 conflict', () => {
    it('maps DOCUMENTO_DUPLICADO to documentNumber', () => {
      const out = normalizeAdminError(
        httpError(409, { code: 'DOCUMENTO_DUPLICADO', message: 'The entered identity document is already associated with another registered user in the system.' })
      );
      expect(out.kind).toBe('conflict');
      expect(Object.keys(out.fieldErrors)).toEqual(['documentNumber']);
      expect(out.fieldErrors.documentNumber).toMatch(/documento ya está registrado/);
      expect(out.globalMessage).toBeNull();
    });

    it('maps DUPLICATE_EMAIL to correoElectronico', () => {
      const out = normalizeAdminError(
        httpError(409, { code: 'DUPLICATE_EMAIL', message: 'The email address entered is already registered in the system.' })
      );
      expect(Object.keys(out.fieldErrors)).toEqual(['correoElectronico']);
      expect(out.fieldErrors.correoElectronico).toMatch(/correo electrónico ya está registrado/);
    });

    it('uses a global alert for an unrecognized conflict code', () => {
      const out = normalizeAdminError(httpError(409, { code: 'OTRO', message: 'Conflicto' }));
      expect(out.fieldErrors).toEqual({});
      expect(out.globalMessage).toMatch(/conflicto/);
    });
  });

  it('maps 401 to a warning about the expired session', () => {
    const out = normalizeAdminError(httpError(401, { code: 'NO_AUTENTICADO' }));
    expect(out.kind).toBe('unauthenticated');
    expect(out.severity).toBe('warning');
    expect(out.globalMessage).toMatch(/sesión expiró/);
  });

  it('maps 403 to a permissions message', () => {
    const out = normalizeAdminError(httpError(403, { code: 'ACCESO_DENEGADO' }));
    expect(out.kind).toBe('forbidden');
    expect(out.globalMessage).toMatch(/Súper Usuario/);
  });

  it('maps 5xx to a server error', () => {
    const out = normalizeAdminError(httpError(500, { code: 'INTERNAL_ERROR' }));
    expect(out.kind).toBe('server');
    expect(out.globalMessage).toMatch(/error inesperado/);
  });

  it('maps a missing response to a network error', () => {
    const out = normalizeAdminError({ code: 'ECONNABORTED', message: 'timeout of 0ms exceeded' });
    expect(out.kind).toBe('network');
    expect(out.globalMessage).toMatch(/conectar con el servidor/);
  });

  it('uses the fallback for any other status', () => {
    const out = normalizeAdminError(httpError(404, {}));
    expect(out.kind).toBe('unknown');
    expect(out.globalMessage).toMatch(/No se pudo registrar/);
  });
});
