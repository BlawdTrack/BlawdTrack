import { describe, it, expect } from 'vitest';
import { getBlockedPackageMessage, getDeletionResultMessage, shouldReloadAfter } from './packageDeletionMessages';
import { PACKAGE_STATES } from '../config/packageStates';

const PAQUETE = { shipmentNumber: 'BG-2026-00125', status: PACKAGE_STATES.PENDING };
const failure = (status, code, extra = {}) => ({ ok: false, paquete: PAQUETE, status, code, ...extra });

describe('packageDeletionMessages (HU-012 / T07)', () => {
  it('éxito: mensaje verde con el número de envío', () => {
    expect(getDeletionResultMessage({ ok: true, paquete: PAQUETE })).toEqual({
      message: 'Paquete BG-2026-00125 eliminado correctamente.',
      severity: 'success',
    });
  });

  it.each([
    [409, 'PAQUETE_DESPACHADO', 'El paquete BG-2026-00125 ya fue despachado y no puede eliminarse.', 'warning'],
    [409, 'PAQUETE_ENTREGADO', 'El paquete BG-2026-00125 ya fue entregado y no puede eliminarse.', 'warning'],
    [404, 'PAQUETE_NO_ENCONTRADO', 'El paquete BG-2026-00125 ya no existe. La lista se actualizó.', 'error'],
    [403, 'ACCESS_DENIED', 'No tienes permiso para eliminar paquetes.', 'error'],
    [403, 'ACCESO_DENEGADO', 'No tienes permiso para eliminar paquetes.', 'error'],
  ])('%i %s → mensaje propio', (status, code, message, severity) => {
    expect(getDeletionResultMessage(failure(status, code))).toEqual({ message, severity });
  });

  it.each([
    [409, 'El paquete BG-2026-00125 ya no puede eliminarse.', 'warning'],
    [404, 'El paquete BG-2026-00125 ya no existe. La lista se actualizó.', 'error'],
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

  it('aviso del botón no eliminable, con el nombre legible del estado', () => {
    expect(getBlockedPackageMessage({ shipmentNumber: 'BG-2026-00122', status: PACKAGE_STATES.IN_TRANSIT })).toEqual({
      message: 'El paquete BG-2026-00122 está en “En tránsito”: ya no puede eliminarse.',
      severity: 'warning',
    });
  });

  it('recarga la lista solo tras un 409 o un 404', () => {
    expect(shouldReloadAfter(failure(409, 'PAQUETE_DESPACHADO'))).toBe(true);
    expect(shouldReloadAfter(failure(404, 'PAQUETE_NO_ENCONTRADO'))).toBe(true);
    expect(shouldReloadAfter(failure(403, 'ACCESS_DENIED'))).toBe(false);
    expect(shouldReloadAfter(failure(null, null))).toBe(false);
    expect(shouldReloadAfter({ ok: true, paquete: PAQUETE })).toBe(false);
  });
});
