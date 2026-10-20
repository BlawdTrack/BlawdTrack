import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
  ALL_FIELDS,
  DEFAULT_PAGE,
  SEARCH_PAGE_SIZE,
} from '../config/packageSearch';
import { searchPackages } from '../services/PackageService';
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
 * "Buscar" (o Enter), igual que en "Roles y permisos"; "Limpiar" vuelve a la lista de distribución. Cancela la
 * petición anterior y maneja los errores. La lista se trae de a `SEARCH_PAGE_SIZE` paquetes; `loadMore` suma la
 * página siguiente de lo que se está viendo (la lista completa o los resultados de la búsqueda).
 * @returns {{ term: string, setTerm: Function, field: string, setField: Function, appliedTerm: string,
 *   search: Function, clearSearch: Function, results: object|null, distributionResults: object|null,
 *   isLoading: boolean, errorMessage: string|null, canLoadMore: boolean, isLoadingMore: boolean,
 *   loadMore: Function }}
 */
export function usePackageSearch() {
  const [term, setTerm] = useState('');
  const [field, setField] = useState(ALL_FIELDS);
  const [applied, setApplied] = useState(null);
  const [results, setResults] = useState(null);
  const [distributionResults, setDistributionResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const distributionControllerRef = useRef(null);
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

  const search = () => {
    cancelCurrentRequest();
    cancelLoadMore();
    const requestId = ++requestSequenceRef.current;
    const normalizedTerm = normalizeSearchTerm(term);
    setResults(null);
    setErrorMessage(null);

    if (!normalizedTerm) {
      setApplied(null);
      setIsLoading(false);
      return;
    }

    const next = { term: normalizedTerm, field };
    const controller = new AbortController();
    currentControllerRef.current = controller;
    setApplied(next);
    setIsLoading(true);

    searchPackages({
      term: next.term,
      field: next.field,
      page: DEFAULT_PAGE,
      size: SEARCH_PAGE_SIZE,
      signal: controller.signal,
    })
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

  const clearSearch = () => {
    cancelCurrentRequest();
    cancelLoadMore();
    requestSequenceRef.current += 1;
    setTerm('');
    setApplied(null);
    setResults(null);
    setIsLoading(false);
    setErrorMessage(null);
  };

  useEffect(() => {
    const controller = new AbortController();
    distributionControllerRef.current = controller;

    searchPackages({
      term: '',
      page: DEFAULT_PAGE,
      size: SEARCH_PAGE_SIZE,
      signal: controller.signal,
    })
      .then((payload) => {
        setDistributionResults(payload ?? null);
        setErrorMessage(null);
      })
      .catch((error) => {
        if (!isCancelled(error)) {
          setErrorMessage(normalizePackageSearchError(error).globalMessage);
        }
      });

    return () => {
      controller.abort();
      distributionControllerRef.current = null;
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
    distributionControllerRef.current?.abort();
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
    appliedTerm,
    search,
    clearSearch,
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
