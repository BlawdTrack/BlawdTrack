import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePackageDeletion } from './usePackageDeletion';
import { deletePackage } from '../services/PackageDeletionService';

vi.mock('../services/PackageDeletionService', () => ({ deletePackage: vi.fn() }));

const PAQUETE = { shipmentNumber: 'BG-2026-00125', customerName: 'Paola Herrera Sánchez', address: 'Atenas', status: 'PENDING' };

const httpError = (status, code) => Object.assign(new Error('Request failed'), { response: { status, data: { code } } });

function renderDeletion(options) {
  return renderHook(() => usePackageDeletion(options));
}

describe('usePackageDeletion (HU-012 / T06)', () => {
  beforeEach(() => {
    deletePackage.mockReset();
  });

  it('open deja el paquete en confirmación y close lo descarta sin llamar al servicio', () => {
    const { result } = renderDeletion();

    act(() => result.current.open(PAQUETE));
    expect(result.current.selected).toBe(PAQUETE);

    act(() => result.current.close());
    expect(result.current.selected).toBeNull();
    expect(deletePackage).not.toHaveBeenCalled();
  });

  it('confirmar llama al servicio una sola vez con el número de envío y, al tener éxito, avisa y cierra', async () => {
    deletePackage.mockResolvedValue({ message: 'Paquete eliminado correctamente.' });
    const onDeleted = vi.fn();
    const onResult = vi.fn();
    const { result } = renderDeletion({ onDeleted, onResult });

    act(() => result.current.open(PAQUETE));
    let outcome;
    await act(async () => {
      outcome = await result.current.confirm();
    });

    expect(deletePackage).toHaveBeenCalledTimes(1);
    expect(deletePackage).toHaveBeenCalledWith('BG-2026-00125');
    expect(outcome).toEqual({ ok: true, paquete: PAQUETE });
    expect(onDeleted).toHaveBeenCalledWith(PAQUETE);
    expect(onResult).toHaveBeenCalledWith({ ok: true, paquete: PAQUETE });
    expect(result.current.selected).toBeNull();
    expect(result.current.isDeleting).toBe(false);
  });

  it('un doble clic en confirmar no duplica la llamada', async () => {
    let resolveDelete;
    deletePackage.mockReturnValue(new Promise((resolve) => { resolveDelete = resolve; }));
    const { result } = renderDeletion();

    act(() => result.current.open(PAQUETE));
    let first;
    let second;
    act(() => {
      first = result.current.confirm();
      second = result.current.confirm();
    });

    expect(result.current.isDeleting).toBe(true);
    await act(async () => {
      resolveDelete({ message: 'ok' });
      await first;
    });

    expect(await second).toBeNull();
    expect(deletePackage).toHaveBeenCalledTimes(1);
  });

  it('mientras elimina, close no cierra el diálogo', async () => {
    let resolveDelete;
    deletePackage.mockReturnValue(new Promise((resolve) => { resolveDelete = resolve; }));
    const { result } = renderDeletion();

    act(() => result.current.open(PAQUETE));
    let pending;
    act(() => {
      pending = result.current.confirm();
    });
    act(() => result.current.close());

    expect(result.current.selected).toBe(PAQUETE);

    await act(async () => {
      resolveDelete({ message: 'ok' });
      await pending;
    });
  });

  it.each([
    [409, 'PAQUETE_DESPACHADO'],
    [409, 'PAQUETE_ENTREGADO'],
    [404, 'PAQUETE_NO_ENCONTRADO'],
    [403, 'ACCESO_DENEGADO'],
  ])('un %i %s cierra el diálogo y devuelve status y code, sin dar el paquete por eliminado', async (status, code) => {
    deletePackage.mockRejectedValue(httpError(status, code));
    const onDeleted = vi.fn();
    const onResult = vi.fn();
    const { result } = renderDeletion({ onDeleted, onResult });

    act(() => result.current.open(PAQUETE));
    let outcome;
    await act(async () => {
      outcome = await result.current.confirm();
    });

    expect(outcome).toEqual({ ok: false, paquete: PAQUETE, status, code });
    expect(onResult).toHaveBeenCalledWith(outcome);
    expect(onDeleted).not.toHaveBeenCalled();
    expect(result.current.selected).toBeNull();
  });

  it('sin respuesta del servidor (error de red) devuelve status y code en null', async () => {
    deletePackage.mockRejectedValue(new Error('Network Error'));
    const { result } = renderDeletion();

    act(() => result.current.open(PAQUETE));
    let outcome;
    await act(async () => {
      outcome = await result.current.confirm();
    });

    expect(outcome).toEqual({ ok: false, paquete: PAQUETE, status: null, code: null });
  });

  it('confirmar sin paquete seleccionado no llama al servicio', async () => {
    const { result } = renderDeletion();

    let outcome;
    await act(async () => {
      outcome = await result.current.confirm();
    });

    expect(outcome).toBeNull();
    expect(deletePackage).not.toHaveBeenCalled();
  });
});
