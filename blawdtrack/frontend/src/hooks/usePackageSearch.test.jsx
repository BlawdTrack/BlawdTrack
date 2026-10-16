import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePackageSearch } from './usePackageSearch';
import { searchPackages } from '../services/PackageService';

vi.mock('../services/PackageService', () => ({
  searchPackages: vi.fn(),
}));

describe('usePackageSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads the distribution immediately and waits to debounce typed searches', async () => {
    searchPackages.mockResolvedValue({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 });

    const { result } = renderHook(() => usePackageSearch());

    expect(searchPackages).toHaveBeenCalledTimes(1);
    expect(searchPackages).toHaveBeenCalledWith(expect.objectContaining({ term: '' }));
    await act(async () => {
      vi.advanceTimersByTime(299);
    });
    expect(searchPackages).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(searchPackages).toHaveBeenCalledTimes(1);
    expect(result.current.distributionResults.totalElements).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('coalesces a burst of changes into a single request and ignores trailing spaces', async () => {
    searchPackages.mockResolvedValue({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 });

    const { result } = renderHook(() => usePackageSearch());

    act(() => {
      result.current.setTerm('  paquete  ');
      result.current.setTerm('  paquete  ');
      result.current.setTerm('paquete  ');
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(searchPackages).toHaveBeenCalledTimes(2);
    expect(searchPackages).toHaveBeenLastCalledWith(expect.objectContaining({ term: 'paquete' }));
  });

  it('runs the same search again after clearing it', async () => {
    searchPackages.mockResolvedValue({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 });

    const { result } = renderHook(() => usePackageSearch());
    act(() => {
      result.current.setTerm('limon');
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    act(() => {
      result.current.clearSearch();
    });
    act(() => {
      result.current.setTerm('limon');
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(searchPackages).toHaveBeenCalledTimes(3);
    expect(searchPackages).toHaveBeenLastCalledWith(expect.objectContaining({ term: 'limon' }));
  });

  it('restores the initial state immediately when clearing an in-flight search', async () => {
    searchPackages
      .mockResolvedValueOnce({ content: [{ id: 'distribution' }], totalElements: 1 })
      .mockImplementationOnce(() => new Promise(() => {}));

    const { result } = renderHook(() => usePackageSearch());
    await act(async () => {});

    act(() => {
      result.current.setTerm('limon');
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.results).toEqual({ content: [{ id: 'distribution' }], totalElements: 1 });
  });

  it('keeps the previous results while a newer query is in flight and ignores old responses', async () => {
    searchPackages
      .mockResolvedValueOnce({ content: [], totalElements: 0 })
      .mockImplementationOnce(() => new Promise((resolve) => {
        setTimeout(() => resolve({ content: [{ id: 'old' }], page: 0, size: 100, totalElements: 1, totalPages: 1 }), 500);
      }))
      .mockImplementationOnce(() => new Promise((resolve) => {
        setTimeout(() => resolve({ content: [{ id: 'new' }], page: 0, size: 100, totalElements: 1, totalPages: 1 }), 100);
      }));

    const { result } = renderHook(() => usePackageSearch());

    act(() => {
      result.current.setTerm('viejo');
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    act(() => {
      result.current.setTerm('nuevo');
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(result.current.results).toEqual({ content: [{ id: 'new' }], page: 0, size: 100, totalElements: 1, totalPages: 1 });
  });

  it('stores the error message when the request fails and ignores cancellation errors', async () => {
    searchPackages.mockRejectedValueOnce({ response: { status: 500 } });
    const { result } = renderHook(() => usePackageSearch());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(result.current.errorMessage).toMatch(/error inesperado/i);
    expect(result.current.isLoading).toBe(false);
  });
});
