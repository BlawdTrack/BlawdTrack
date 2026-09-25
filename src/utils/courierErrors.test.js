import { describe, it, expect } from 'vitest';
import { normalizeCourierError } from './courierErrors';

const httpError = (status, data) => ({ response: { status, data } });

describe('normalizeCourierError', () => {
  describe('400 validation', () => {
    it('maps several fields from the message', () => {
      const out = normalizeCourierError(
        httpError(400, { code: 'VALIDATION_FAILED', message: 'Revise los campos: email, maxPackageWeightKg', status: 400 })
      );
      expect(out.kind).toBe('validation');
      expect(Object.keys(out.fieldErrors).sort()).toEqual(['email', 'maxPackageWeightKg']);
      expect(out.fieldErrors.maxPackageWeightKg).toMatch(/positivo/);
      expect(out.globalMessage).toBeNull();
    });

    it('uses the backend message for an unknown field, else a generic alert', () => {
      const withMessage = normalizeCourierError(
        httpError(400, { code: 'VALIDATION_ERROR', errores: [{ campo: 'otro', mensaje: 'Texto del backend' }] })
      );
      expect(withMessage.fieldErrors).toEqual({});
      expect(withMessage.globalMessage).toBe('Texto del backend');

      const withoutMessage = normalizeCourierError(
        httpError(400, { code: 'VALIDATION_FAILED', message: 'Revise los campos: otro' })
      );
      expect(withoutMessage.globalMessage).toMatch(/Revisa los datos/);
    });

    it('marks documentNumber when VALIDATION_FAILED comes with an empty list', () => {
      const out = normalizeCourierError(
        httpError(400, { code: 'VALIDATION_FAILED', message: 'Revise los campos: ' })
      );
      expect(out.fieldErrors.documentNumber).toMatch(/número de documento/);
      expect(out.globalMessage).toBeNull();
    });

    it('tolerates VALIDATION_ERROR with errores[]', () => {
      const out = normalizeCourierError(
        httpError(400, { code: 'VALIDATION_ERROR', errores: [{ campo: 'fullName', mensaje: 'x' }, { campo: 'schedule', mensaje: 'y' }] })
      );
      expect(Object.keys(out.fieldErrors).sort()).toEqual(['fullName', 'schedule']);
    });

    it('falls back to a generic alert for VALIDATION_ERROR with no fields', () => {
      const out = normalizeCourierError(httpError(400, { code: 'VALIDATION_ERROR' }));
      expect(out.globalMessage).toMatch(/Revisa los datos/);
    });
  });

  describe('409 conflict', () => {
    it.each([
      ['El documento ya está registrado', 'documentNumber'],
      ['El documento ya esta registrado', 'documentNumber'],
      ['El correo ya está registrado', 'email'],
      ['EL CORREO YA ESTA REGISTRADO', 'email'],
      ['El teléfono ya está registrado', 'phone'],
      ['El telefono ya esta registrado', 'phone'],
    ])('maps "%s" to %s', (message, field) => {
      const out = normalizeCourierError(httpError(409, { code: 'COURIER_CONFLICT', message }));
      expect(out.kind).toBe('conflict');
      expect(Object.keys(out.fieldErrors)).toEqual([field]);
      expect(out.globalMessage).toBeNull();
    });

    it('uses a global alert for a generic conflict', () => {
      const out = normalizeCourierError(
        httpError(409, { code: 'COURIER_CONFLICT', message: 'Los datos del mensajero entran en conflicto con un registro existente' })
      );
      expect(out.fieldErrors).toEqual({});
      expect(out.globalMessage).toMatch(/conflicto/);
    });
  });

  it('maps 401 to a warning about the expired session', () => {
    const out = normalizeCourierError(httpError(401, { code: 'NO_AUTENTICADO' }));
    expect(out.kind).toBe('unauthenticated');
    expect(out.severity).toBe('warning');
    expect(out.globalMessage).toMatch(/sesión expiró/);
  });

  it('maps 403 to a permissions message', () => {
    const out = normalizeCourierError(httpError(403, { code: 'ACCESS_DENIED' }));
    expect(out.kind).toBe('forbidden');
    expect(out.globalMessage).toMatch(/permisos/);
  });

  it('maps 5xx to a server error', () => {
    const out = normalizeCourierError(httpError(500, { code: 'INTERNAL_ERROR' }));
    expect(out.kind).toBe('server');
    expect(out.globalMessage).toMatch(/error inesperado/);
  });

  it('maps a missing response to a network error', () => {
    const out = normalizeCourierError({ code: 'ECONNABORTED', message: 'timeout of 0ms exceeded' });
    expect(out.kind).toBe('network');
    expect(out.globalMessage).toMatch(/conectar con el servidor/);
  });

  it('uses the fallback for any other status', () => {
    const out = normalizeCourierError(httpError(404, {}));
    expect(out.kind).toBe('unknown');
    expect(out.globalMessage).toMatch(/No se pudo registrar/);
  });
});
