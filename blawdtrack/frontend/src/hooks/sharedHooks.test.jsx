import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDocumentSearch } from './useDocumentSearch';
import { useConfirmLeave } from './useConfirmLeave';
import { useToast } from './useToast';

const people = [
  { id: 1, documentType: 'CEDULA', documentNumber: '1-0345-0678' },
  { id: 2, documentType: 'CEDULA', documentNumber: '2-0456-0789' },
  { id: 3, documentType: 'DIMEX', documentNumber: '103450678' },
];

describe('useDocumentSearch', () => {
  it('returns everything until a search is applied', () => {
    const { result } = renderHook(() => useDocumentSearch());
    expect(result.current.filter(people)).toHaveLength(3);
    expect(result.current.isFiltering).toBe(false);
  });

  it('filters by document type and by the digits of the number, ignoring dashes', () => {
    const { result } = renderHook(() => useDocumentSearch());

    act(() => result.current.setDocumentNumber('0345'));
    expect(result.current.filter(people)).toHaveLength(3); // todavía sin aplicar

    act(() => result.current.search());
    expect(result.current.isFiltering).toBe(true);
    expect(result.current.filter(people).map((p) => p.id)).toEqual([1]); // Cédula; el DIMEX es de otro tipo

    act(() => result.current.setDocumentType('DIMEX'));
    act(() => result.current.search());
    expect(result.current.filter(people).map((p) => p.id)).toEqual([3]);
  });

  it('clears the filter and treats an empty number as no filter', () => {
    const { result } = renderHook(() => useDocumentSearch());
    act(() => result.current.setDocumentNumber('2-0456'));
    act(() => result.current.search());
    expect(result.current.filter(people)).toHaveLength(1);

    act(() => result.current.clear());
    expect(result.current.documentNumber).toBe('');
    expect(result.current.filter(people)).toHaveLength(3);

    act(() => result.current.setDocumentNumber('   '));
    act(() => result.current.search());
    expect(result.current.isFiltering).toBe(false);
  });

  it('reads the document with a custom getter', () => {
    const { result } = renderHook(() => useDocumentSearch((item) => item.cedula));
    act(() => result.current.setDocumentNumber('777'));
    act(() => result.current.search());
    expect(result.current.filter([{ documentType: 'CEDULA', cedula: '1-777' }, { documentType: 'CEDULA', cedula: '1-888' }])).toHaveLength(1);
  });
});

describe('useConfirmLeave', () => {
  it('runs the action right away when there is nothing unsaved', () => {
    const action = vi.fn();
    const { result } = renderHook(() => useConfirmLeave(false));

    act(() => result.current.runOrConfirmLeave(action));

    expect(action).toHaveBeenCalledTimes(1);
    expect(result.current.dialogProps.open).toBe(false);
  });

  it('asks first when there are unsaved changes and runs the action only if the user leaves', () => {
    const action = vi.fn();
    const { result } = renderHook(() => useConfirmLeave(true));

    act(() => result.current.runOrConfirmLeave(action));
    expect(action).not.toHaveBeenCalled();
    expect(result.current.dialogProps.open).toBe(true);

    act(() => result.current.dialogProps.onStay());
    expect(action).not.toHaveBeenCalled();
    expect(result.current.dialogProps.open).toBe(false);

    act(() => result.current.runOrConfirmLeave(action));
    act(() => result.current.dialogProps.onLeave());
    expect(action).toHaveBeenCalledTimes(1);
    expect(result.current.dialogProps.open).toBe(false);
  });
});

describe('useToast', () => {
  it('opens with the message and severity and closes keeping the last message', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toast.open).toBe(false);

    act(() => result.current.notify('Guardado'));
    expect(result.current.toast).toEqual({ open: true, message: 'Guardado', severity: 'success' });

    act(() => result.current.notify('Ojo', 'warning'));
    expect(result.current.toast.severity).toBe('warning');

    act(() => result.current.close());
    expect(result.current.toast).toEqual({ open: false, message: 'Ojo', severity: 'warning' });
  });
});
