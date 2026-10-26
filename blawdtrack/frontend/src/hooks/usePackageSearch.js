import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
  ALL_FIELDS,
  ALL_STATUSES,
  DEFAULT_PAGE,
  SEARCH_PAGE_SIZE,
} from '../config/packageSearch';
import { fetchStatusCounts, searchPackages } from '../services/PackageService';
import { normalizePackageSearchError } from '../utils/packageSearchErrors';
import { appendPage, hasMorePages } from '../utils/packageSearchPages';
import { normalizeSearchTerm } from '../utils/packageSearchTerm';

const isCancelled = (error) => Boolean(
  axios.isCancel?.(error)
  || error?.code === 'ERR_CANCELED'
  || error?.name === 'CanceledError'
  || error?.message === 'canceled'
);

/**
 * Orquesta la búsqueda de paquetes: el término y el campo se escriben libremente y la búsqueda se hace al pulsar
 * "Buscar" (o Enter), igual que en "Roles y permisos"; los ejemplos y las pestañas de estado buscan al instante.
 * "Limpiar" vuelve a la lista de distribución. Cancela la petición anterior y maneja los errores. La lista se trae de a
 * `SEARCH_PAGE_SIZE` paquetes; `loadMore` suma la página siguiente de lo que se está viendo (la lista completa, o los
 * resultados de la búsqueda o del filtro de estado). `refresh` vuelve a pedir lo que se ve y los conteos (por ejemplo,
 * tras eliminar un paquete).
 * @returns {{ term: string, setTerm: Function, field: string, setField: Function, status: string,
 *   setStatus: Function, appliedTerm: string, isFiltering: boolean, statusCounts: Record<string, number>|null,
 *   search: Function, clearSearch: Function, refresh: Function, results: object|null,
 *   distributionResults: object|null, isLoading: boolean, errorMessage: string|null, canLoadMore: boolean,
 *   isLoadingMore: boolean, loadMore: Function }}
 */
export function usePackageSearch() {
  const [term, setTerm] = useState('');
  const [field, setField] = useState(ALL_FIELDS);
  const [status, setStatusValue] = useState(ALL_STATUSES);
  const [applied, setApplied] = useState(null);
  const [results, setResults] = useState(null);
  const [distributionResults, setDistributionResults] = useState(null);
  const [statusCounts, setStatusCounts] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const distributionControllerRef = useRef(null);
  const countsControllerRef = useRef(null);
  const currentControllerRef = useRef(null);
  const loadMoreControllerRef = useRef(null);
  const requestSequenceRef = useRef(0);
  const loadMoreSequenceRef = useRef(0);

  const cancelCurrentRequest = () => {
    if (currentControllerRef.current) {
      currentControllerRef.current.abort();
      currentControllerRef.current = null;
    }
  };

  // Una página pedida con "Cargar más" ya no sirve si cambia lo que se está viendo (otra búsqueda, o limpiar).
  // No toca el estado: al terminar la petición cancelada, su `finally` apaga el indicador de carga.
  const cancelLoadMore = () => {
    loadMoreControllerRef.current?.abort();
    loadMoreControllerRef.current = null;
    loadMoreSequenceRef.current += 1;
  };

  const loadDistribution = () => {
    distributionControllerRef.current?.abort();
    const controller = new AbortController();
    distributionControllerRef.current = controller;

    searchPackages({ term: '', page: DEFAULT_PAGE, size: SEARCH_PAGE_SIZE, signal: controller.signal })
      .then((payload) => {
        setDistributionResults(payload ?? null);
        setErrorMessage(null);
      })
      .catch((error) => {
        if (!isCancelled(error)) {
          setErrorMessage(normalizePackageSearchError(error).globalMessage);
        }
      });
  };

  // Los conteos de las pestañas son un adorno: si fallan, las pestañas se muestran sin número.
  const loadStatusCounts = () => {
    countsControllerRef.current?.abort();
    const controller = new AbortController();
    countsControllerRef.current = controller;

    fetchStatusCounts({ signal: controller.signal })
      .then((payload) => setStatusCounts(payload ?? null))
      .catch(() => {});
  };

  // Aplica una búsqueda (término, campo y estado). Sin término ni estado vuelve a la lista de distribución.
  const runSearch = (next) => {
    cancelCurrentRequest();
    cancelLoadMore();
    const requestId = ++requestSequenceRef.current;
    const normalizedTerm = normalizeSearchTerm(next.term);
    setResults(null);
    setErrorMessage(null);

    if (!normalizedTerm && next.status === ALL_STATUSES) {
      setApplied(null);
      setIsLoading(false);
      return;
    }

    const request = { term: normalizedTerm, field: next.field, status: next.status };
    const controller = new AbortController();
    currentControllerRef.current = controller;
    setApplied(request);
    setIsLoading(true);

    searchPackages({ ...request, page: DEFAULT_PAGE, size: SEARCH_PAGE_SIZE, signal: controller.signal })
      .then((payload) => {
        if (requestSequenceRef.current === requestId) {
          setResults(payload ?? null);
        }
      })
      .catch((error) => {
        if (requestSequenceRef.current === requestId && !isCancelled(error)) {
          setErrorMessage(normalizePackageSearchError(error).globalMessage);
        }
      })
      .finally(() => {
        if (requestSequenceRef.current === requestId) {
          currentControllerRef.current = null;
          setIsLoading(false);
        }
      });
  };

  const search = () => runSearch({ term, field, status });

  // Elegir un estado filtra al instante lo que se está viendo: la búsqueda aplicada, o la lista completa.
  const setStatus = (nextStatus) => {
    setStatusValue(nextStatus);
    runSearch({ term: applied?.term ?? '', field: applied?.field ?? field, status: nextStatus });
  };

  const clearSearch = () => {
    cancelCurrentRequest();
    cancelLoadMore();
    requestSequenceRef.current += 1;
    setTerm('');
    setStatusValue(ALL_STATUSES);
    setApplied(null);
    setResults(null);
    setIsLoading(false);
    setErrorMessage(null);
  };

  const refresh = () => {
    loadStatusCounts();
    loadDistribution();
    if (applied) runSearch(applied);
  };

  useEffect(() => {
    loadDistribution();
    loadStatusCounts();

    return () => {
      distributionControllerRef.current?.abort();
      countsControllerRef.current?.abort();
    };
  }, []);

  const appliedTerm = applied?.term ?? '';
  const effectiveResults = applied ? results : distributionResults;
  const canLoadMore = !isLoading && hasMorePages(effectiveResults);

  const loadMore = () => {
    if (!canLoadMore || isLoadingMore) {
      return;
    }

    const controller = new AbortController();
    const requestId = ++loadMoreSequenceRef.current;
    const setPages = applied ? setResults : setDistributionResults;
    loadMoreControllerRef.current = controller;
    setErrorMessage(null);
    setIsLoadingMore(true);

    searchPackages({
      term: appliedTerm,
      field: applied?.field,
      status: applied?.status,
      page: effectiveResults.page + 1,
      size: SEARCH_PAGE_SIZE,
      signal: controller.signal,
    })
      .then((payload) => {
        if (loadMoreSequenceRef.current === requestId) {
          setPages((loaded) => appendPage(loaded, payload));
        }
      })
      .catch((error) => {
        if (loadMoreSequenceRef.current === requestId && !isCancelled(error)) {
          setErrorMessage(normalizePackageSearchError(error).globalMessage);
        }
      })
      .finally(() => {
        // Una petición cancelada también apaga el indicador, salvo que ya haya salido otra más nueva.
        if (loadMoreControllerRef.current === null || loadMoreControllerRef.current === controller) {
          loadMoreControllerRef.current = null;
          setIsLoadingMore(false);
        }
      });
  };

  useEffect(() => () => {
    cancelCurrentRequest();
    loadMoreControllerRef.current?.abort();
    loadMoreSequenceRef.current += 1;
    requestSequenceRef.current += 1;
  }, []);

  return {
    term,
    setTerm,
    field,
    setField,
    status,
    setStatus,
    appliedTerm,
    isFiltering: applied !== null,
    statusCounts,
    search,
    clearSearch,
    refresh,
    results: effectiveResults,
    distributionResults,
    isLoading,
    errorMessage,
    canLoadMore,
    isLoadingMore,
    loadMore,
  };
}

export default usePackageSearch;
