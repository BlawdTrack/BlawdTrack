import { describe, it, expect } from 'vitest';
import { getBlockedPackageMessage, getDeletionResultMessage, shouldReloadAfter } from './packageDeletionMessages';

const PKG = { shipmentNumber: 'BG-2026-00125', status: 'PENDING' };
const failure = (status, code, extra = {}) => ({ ok: false, pkg: PKG, status, code, ...extra });

describe('packageDeletionMessages (HU-012 / T07)', () => {
  it('éxito: mensaje verde con el número de envío', () => {
    expect(getDeletionResultMessage({ ok: true, pkg: PKG })).toEqual({
      message: 'Paquete BG-2026-00125 eliminado correctamente.',
      severity: 'success',
    });
  });

  it.each([
    [409, 'PAQUETE_DESPACHADO', 'El paquete BG-2026-00125 ya salió a reparto: ya no puede eliminarse.', 'warning'],
    [409, 'PAQUETE_ENTREGADO', 'El paquete BG-2026-00125 está en “Entregado”: ya no puede eliminarse.', 'warning'],
    [404, 'PAQUETE_NO_ENCONTRADO', 'El paquete BG-2026-00125 ya no existe.', 'error'],
    [403, 'ACCESS_DENIED', 'No tienes permiso para eliminar paquetes.', 'error'],
    [403, 'ACCESO_DENEGADO', 'No tienes permiso para eliminar paquetes.', 'error'],
  ])('%i %s → mensaje propio', (status, code, message, severity) => {
    expect(getDeletionResultMessage(failure(status, code))).toEqual({ message, severity });
  });

  it.each([
    [409, 'El paquete BG-2026-00125 ya no puede eliminarse.', 'warning'],
    [404, 'El paquete BG-2026-00125 ya no existe.', 'error'],
    [403, 'No tienes permiso para eliminar paquetes.', 'error'],
  ])('un %i con un code desconocido usa el mensaje de su estado HTTP', (status, message, severity) => {
    expect(getDeletionResultMessage(failure(status, 'CODIGO_NUEVO'))).toEqual({ message, severity });
  });

  it.each([
    ['error de red', null, null],
    ['500', 500, 'INTERNAL_ERROR'],
    ['400', 400, 'VALIDATION_ERROR'],
  ])('%s → mensaje genérico de error', (_, status, code) => {
    expect(getDeletionResultMessage(failure(status, code))).toEqual({
      message: 'No se pudo eliminar el paquete. Intenta de nuevo.',
      severity: 'error',
    });
  });

  it('un 401 no tiene mensaje: lo atiende el flujo de sesión', () => {
    expect(getDeletionResultMessage(failure(401, 'NO_AUTENTICADO'))).toBeNull();
  });

  it('nunca muestra el message crudo del backend', () => {
    const result = failure(403, 'ACCESS_DENIED', { message: 'You do not have permission to perform this action.' });

    expect(getDeletionResultMessage(result).message).not.toMatch(/permission/);
  });

  it('el aviso del botón no eliminable usa el nombre legible del estado y la misma forma que el 409', () => {
    expect(getBlockedPackageMessage({ shipmentNumber: 'BG-2026-00122', status: 'IN_TRANSIT' })).toEqual({
      message: 'El paquete BG-2026-00122 está en “En tránsito”: ya no puede eliminarse.',
      severity: 'warning',
    });
    expect(getBlockedPackageMessage({ shipmentNumber: 'BG-2026-00125', status: 'DELIVERED' })).toEqual(
      getDeletionResultMessage(failure(409, 'PAQUETE_ENTREGADO'))
    );
  });

  it('vuelve a consultar el paquete solo tras un 409 o un 404', () => {
    expect(shouldReloadAfter(failure(409, 'PAQUETE_DESPACHADO'))).toBe(true);
    expect(shouldReloadAfter(failure(404, 'PAQUETE_NO_ENCONTRADO'))).toBe(true);
    expect(shouldReloadAfter(failure(403, 'ACCESS_DENIED'))).toBe(false);
    expect(shouldReloadAfter(failure(null, null))).toBe(false);
    expect(shouldReloadAfter({ ok: true, pkg: PKG })).toBe(false);
  });
});
