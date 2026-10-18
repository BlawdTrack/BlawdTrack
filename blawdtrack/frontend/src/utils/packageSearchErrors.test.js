import { describe, it, expect } from 'vitest';
import { normalizePackageSearchError } from './packageSearchErrors';

const httpError = (status, data = {}) => ({ response: { status, data } });

describe('normalizePackageSearchError', () => {
  it('maps a network error', () => {
    const out = normalizePackageSearchError({ code: 'ECONNABORTED' });
    expect(out.globalMessage).toMatch(/conectar con el servidor/i);
  });

  it('maps 401 to expired session', () => {
    const out = normalizePackageSearchError(httpError(401, { code: 'NO_AUTENTICADO' }));
    expect(out.globalMessage).toMatch(/sesión expiró/i);
  });

  it('maps 403 to permissions message', () => {
    const out = normalizePackageSearchError(httpError(403, { code: 'ACCESO_DENEGADO' }));
    expect(out.globalMessage).toMatch(/permiso|ADMIN_VENTAS/i);
  });

  it('maps 500 to a server error', () => {
    const out = normalizePackageSearchError(httpError(500, { code: 'INTERNAL_ERROR' }));
    expect(out.globalMessage).toMatch(/error inesperado/i);
  });

  it('uses the fallback for other statuses', () => {
    const out = normalizePackageSearchError(httpError(404, {}));
    expect(out.globalMessage).toMatch(/No se pudo realizar la búsqueda/i);
  });
});
