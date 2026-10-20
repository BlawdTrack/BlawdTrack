import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePackageSearch } from './usePackageSearch';
import { fetchStatusCounts, searchPackages } from '../services/PackageService';

vi.mock('../services/PackageService', () => ({
  searchPackages: vi.fn(),
  fetchStatusCounts: vi.fn(),
}));

describe('usePackageSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
    fetchStatusCounts.mockResolvedValue({ PENDING: 3, ASSIGNED: 1, SHIPPED: 0, IN_TRANSIT: 0, DELIVERED: 2, NOT_DELIVERED: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads the distribution immediately and does not search while typing', async () => {
    searchPackages.mockResolvedValue({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 });

    const { result } = renderHook(() => usePackageSearch());

    expect(searchPackages).toHaveBeenCalledTimes(1);
    expect(searchPackages).toHaveBeenCalledWith(expect.objectContaining({ term: '' }));

    act(() => {
      result.current.setTerm('paquete');
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(searchPackages).toHaveBeenCalledTimes(1);
    expect(result.current.distributionResults.totalElements).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('searches once when search is called, trimming the term and sending the chosen field', async () => {
    searchPackages.mockResolvedValue({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 });

    const { result } = renderHook(() => usePackageSearch());

    act(() => {
      result.current.setTerm('  paquete  ');
      result.current.setField('customerName');
    });
    act(() => {
      result.current.search();
    });
    await act(async () => {});

    expect(searchPackages).toHaveBeenCalledTimes(2);
    expect(searchPackages).toHaveBeenLastCalledWith(
      expect.objectContaining({ term: 'paquete', field: 'customerName' })
    );
    expect(result.current.appliedTerm).toBe('paquete');
  });

  it('searching with an empty term goes back to the distribution list', async () => {
    searchPackages
      .mockResolvedValueOnce({ content: [{ id: 'distribution' }], totalElements: 1 })
      .mockResolvedValueOnce({ content: [{ id: 'found' }], totalElements: 1 });
    const { result } = renderHook(() => usePackageSearch());
    await act(async () => {});

    act(() => {
      result.current.setTerm('limon');
    });
    act(() => {
      result.current.search();
    });
    await act(async () => {});
    expect(result.current.results.content[0].id).toBe('found');

    act(() => {
      result.current.setTerm('   ');
    });
    act(() => {
      result.current.search();
    });

    expect(result.current.appliedTerm).toBe('');
    expect(result.current.results.content[0].id).toBe('distribution');
    expect(result.current.isLoading).toBe(false);
  });

  it('runs the same search again after clearing it', async () => {
    searchPackages.mockResolvedValue({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 });

    const { result } = renderHook(() => usePackageSearch());
    act(() => {
      result.current.setTerm('limon');
    });
    act(() => {
      result.current.search();
    });
    await act(async () => {});

    act(() => {
      result.current.clearSearch();
    });
    act(() => {
      result.current.setTerm('limon');
    });
    act(() => {
      result.current.search();
    });
    await act(async () => {});

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
    act(() => {
      result.current.search();
    });
    await act(async () => {});
    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.term).toBe('');
    expect(result.current.results).toEqual({ content: [{ id: 'distribution' }], totalElements: 1 });
  });

  it('ignores the response of an older search when a newer one was made', async () => {
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
    act(() => {
      result.current.search();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    act(() => {
      result.current.setTerm('nuevo');
    });
    act(() => {
      result.current.search();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });

    expect(result.current.results).toEqual({ content: [{ id: 'new' }], page: 0, size: 100, totalElements: 1, totalPages: 1 });
  });

  it('stores the error message when the request fails', async () => {
    searchPackages.mockRejectedValueOnce({ response: { status: 500 } });
    const { result } = renderHook(() => usePackageSearch());

    await act(async () => {});

    expect(result.current.errorMessage).toMatch(/error inesperado/i);
    expect(result.current.isLoading).toBe(false);
  });

  describe('estado, ejemplos y recarga', () => {
    const empty = { content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 };

    it('trae los conteos por estado al montar', async () => {
      searchPackages.mockResolvedValue(empty);
      const { result } = renderHook(() => usePackageSearch());
      await act(async () => {});

      expect(fetchStatusCounts).toHaveBeenCalledTimes(1);
      expect(result.current.statusCounts).toEqual({ PENDING: 3, ASSIGNED: 1, SHIPPED: 0, IN_TRANSIT: 0, DELIVERED: 2, NOT_DELIVERED: 0 });
    });

    it('elegir un estado filtra al instante, sin término, y volver a "Todos" regresa a la lista completa', async () => {
      searchPackages.mockResolvedValue(empty);
      const { result } = renderHook(() => usePackageSearch());
      await act(async () => {});

      act(() => {
        result.current.setStatus('DELIVERED');
      });
      await act(async () => {});

      expect(searchPackages).toHaveBeenLastCalledWith(expect.objectContaining({ term: '', status: 'DELIVERED' }));
      expect(result.current.isFiltering).toBe(true);
      expect(result.current.appliedTerm).toBe('');

      act(() => {
        result.current.setStatus('all');
      });
      expect(result.current.isFiltering).toBe(false);
    });

    it('un estado elegido se combina con la búsqueda aplicada y con el siguiente "Buscar"', async () => {
      searchPackages.mockResolvedValue(empty);
      const { result } = renderHook(() => usePackageSearch());
      await act(async () => {});
      act(() => {
        result.current.setTerm('limon');
      });
      act(() => {
        result.current.search();
      });
      await act(async () => {});

      act(() => {
        result.current.setStatus('PENDING');
      });
      await act(async () => {});

      expect(searchPackages).toHaveBeenLastCalledWith(expect.objectContaining({ term: 'limon', status: 'PENDING' }));
    });

    it('un ejemplo busca su término en todos los campos', async () => {
      searchPackages.mockResolvedValue(empty);
      const { result } = renderHook(() => usePackageSearch());
      await act(async () => {});

      act(() => {
        result.current.searchExample('Heredia');
      });
      await act(async () => {});

      expect(result.current.term).toBe('Heredia');
      expect(searchPackages).toHaveBeenLastCalledWith(expect.objectContaining({ term: 'Heredia', field: 'all' }));
    });

    it('limpiar quita también el estado elegido', async () => {
      searchPackages.mockResolvedValue(empty);
      const { result } = renderHook(() => usePackageSearch());
      await act(async () => {});
      act(() => {
        result.current.setStatus('DELIVERED');
      });
      await act(async () => {});

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.status).toBe('all');
      expect(result.current.isFiltering).toBe(false);
    });

    it('refresh vuelve a pedir la lista, los conteos y la búsqueda aplicada', async () => {
      searchPackages.mockResolvedValue(empty);
      const { result } = renderHook(() => usePackageSearch());
      await act(async () => {});
      act(() => {
        result.current.setStatus('PENDING');
      });
      await act(async () => {});
      searchPackages.mockClear();
      fetchStatusCounts.mockClear();

      act(() => {
        result.current.refresh();
      });
      await act(async () => {});

      expect(fetchStatusCounts).toHaveBeenCalledTimes(1);
      expect(searchPackages).toHaveBeenCalledWith(expect.objectContaining({ term: '' }));
      expect(searchPackages).toHaveBeenCalledWith(expect.objectContaining({ status: 'PENDING' }));
    });

    it('si fallan los conteos las pestañas siguen funcionando sin número', async () => {
      fetchStatusCounts.mockRejectedValue(new Error('x'));
      searchPackages.mockResolvedValue(empty);
      const { result } = renderHook(() => usePackageSearch());
      await act(async () => {});

      expect(result.current.statusCounts).toBeNull();
      expect(result.current.errorMessage).toBeNull();
    });
  });

  describe('loadMore', () => {
    const page = (ids, pageNumber, totalPages = 3) => ({
      content: ids.map((id) => ({ id, shipmentNumber: `ENV-${id}` })),
      page: pageNumber,
      size: 2,
      totalElements: 6,
      totalPages,
    });

    it('trae la página siguiente de la lista completa y la suma a la ya cargada', async () => {
      searchPackages
        .mockResolvedValueOnce(page([6, 5], 0))
        .mockResolvedValueOnce(page([4, 3], 1));
      const { result } = renderHook(() => usePackageSearch());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      expect(result.current.canLoadMore).toBe(true);

      await act(async () => {
        result.current.loadMore();
      });

      expect(searchPackages).toHaveBeenLastCalledWith(expect.objectContaining({ term: '', page: 1 }));
      expect(result.current.results.content.map((pkg) => pkg.id)).toEqual([6, 5, 4, 3]);
      expect(result.current.isLoadingMore).toBe(false);
      expect(result.current.canLoadMore).toBe(true);
    });

    it('no ofrece más páginas cuando la última ya se cargó', async () => {
      searchPackages.mockResolvedValueOnce(page([2, 1], 0, 1));
      const { result } = renderHook(() => usePackageSearch());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      expect(result.current.canLoadMore).toBe(false);
    });

    it('con un término trae la página siguiente de esa búsqueda, no de la lista completa', async () => {
      searchPackages
        .mockResolvedValueOnce(page([6, 5], 0))
        .mockResolvedValueOnce(page([4, 2], 0))
        .mockResolvedValueOnce(page([1, 0], 1));
      const { result } = renderHook(() => usePackageSearch());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      act(() => {
        result.current.setTerm('limon');
      });
      act(() => {
        result.current.search();
      });
      await act(async () => {});

      await act(async () => {
        result.current.loadMore();
      });

      expect(searchPackages).toHaveBeenLastCalledWith(expect.objectContaining({ term: 'limon', page: 1 }));
      expect(result.current.results.content.map((pkg) => pkg.id)).toEqual([4, 2, 1, 0]);
      expect(result.current.distributionResults.content).toHaveLength(2);
    });

    it('descarta la página pedida si antes llega otra búsqueda', async () => {
      let resolveMore;
      searchPackages
        .mockResolvedValueOnce(page([6, 5], 0))
        .mockReturnValueOnce(new Promise((resolve) => { resolveMore = resolve; }))
        .mockResolvedValueOnce(page([9], 0, 1));
      const { result } = renderHook(() => usePackageSearch());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      act(() => {
        result.current.loadMore();
      });
      expect(result.current.isLoadingMore).toBe(true);

      act(() => {
        result.current.setTerm('limon');
      });
      act(() => {
        result.current.search();
      });
      await act(async () => {
        resolveMore(page([4, 3], 1));
      });

      expect(result.current.isLoadingMore).toBe(false);
      expect(result.current.distributionResults.content.map((pkg) => pkg.id)).toEqual([6, 5]);
    });

    it('muestra el error si falla y deja intentar de nuevo', async () => {
      searchPackages
        .mockResolvedValueOnce(page([6, 5], 0))
        .mockRejectedValueOnce({ response: { status: 500 } });
      const { result } = renderHook(() => usePackageSearch());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      await act(async () => {
        result.current.loadMore();
      });

      expect(result.current.errorMessage).toMatch(/error inesperado/i);
      expect(result.current.isLoadingMore).toBe(false);
      expect(result.current.canLoadMore).toBe(true);
    });
  });
});
