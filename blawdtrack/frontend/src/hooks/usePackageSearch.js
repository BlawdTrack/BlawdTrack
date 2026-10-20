import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
  DEFAULT_PAGE,
  SEARCH_DEBOUNCE_MS,
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
 * Orquesta la búsqueda en vivo de paquetes con debounce, cancelación y manejo de errores. La lista se trae de a
 * `SEARCH_PAGE_SIZE` paquetes; `loadMore` suma la página siguiente de lo que se está viendo (la lista completa o
 * los resultados del término).
 * @returns {{ term: string, setTerm: Function, clearSearch: Function, results: object|null,
 *   distributionResults: object|null, isLoading: boolean, errorMessage: string|null, canLoadMore: boolean,
 *   isLoadingMore: boolean, loadMore: Function }}
 */
export function usePackageSearch() {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState(null);
  const [distributionResults, setDistributionResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const distributionControllerRef = useRef(null);
  const currentControllerRef = useRef(null);
  const loadMoreControllerRef = useRef(null);
  const lastRequestedTermRef = useRef(null);
  const requestSequenceRef = useRef(0);
  const loadMoreSequenceRef = useRef(0);

  const cancelCurrentRequest = () => {
    if (currentControllerRef.current) {
      currentControllerRef.current.abort();
      currentControllerRef.current = null;
    }
  };

  // Una página pedida con "Cargar más" ya no sirve si cambia lo que se está viendo (otro término, o limpiar).
  // No toca el estado: al terminar la petición cancelada, su `finally` apaga el indicador de carga.
  const cancelLoadMore = () => {
    loadMoreControllerRef.current?.abort();
    loadMoreControllerRef.current = null;
    loadMoreSequenceRef.current += 1;
  };

  const clearSearch = () => {
    cancelCurrentRequest();
    cancelLoadMore();
    requestSequenceRef.current += 1;
    lastRequestedTermRef.current = null;
    setTerm('');
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

  const activeTerm = normalizeSearchTerm(term);
  const effectiveResults = activeTerm ? results : distributionResults;
  const canLoadMore = !isLoading && hasMorePages(effectiveResults);

  const loadMore = () => {
    if (!canLoadMore || isLoadingMore) {
      return;
    }

    const controller = new AbortController();
    const requestId = ++loadMoreSequenceRef.current;
    const setPages = activeTerm ? setResults : setDistributionResults;
    loadMoreControllerRef.current = controller;
    setErrorMessage(null);
    setIsLoadingMore(true);

    searchPackages({
      term: activeTerm,
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

  useEffect(() => {
    const normalizedTerm = normalizeSearchTerm(term);

    if (!normalizedTerm) {
      cancelCurrentRequest();
      cancelLoadMore();
      requestSequenceRef.current += 1;
      lastRequestedTermRef.current = null;
      return undefined;
    }

    if (normalizedTerm === lastRequestedTermRef.current) {
      return undefined;
    }

    cancelCurrentRequest();
    cancelLoadMore();
    requestSequenceRef.current += 1;
    setResults(null);
    const timeoutId = setTimeout(() => {
      const nextTerm = normalizeSearchTerm(term);

      if (nextTerm === lastRequestedTermRef.current) {
        return;
      }

      const controller = new AbortController();
      const requestId = ++requestSequenceRef.current;

      cancelCurrentRequest();
      currentControllerRef.current = controller;
      lastRequestedTermRef.current = nextTerm;

      setErrorMessage(null);
      setIsLoading(true);

      searchPackages({
        term: nextTerm,
        page: DEFAULT_PAGE,
        size: SEARCH_PAGE_SIZE,
        signal: controller.signal,
      })
        .then((payload) => {
          if (requestSequenceRef.current !== requestId) {
            return;
          }

          setResults(payload ?? null);
          setErrorMessage(null);
        })
        .catch((error) => {
          if (requestSequenceRef.current !== requestId) {
            return;
          }

          if (isCancelled(error)) {
            return;
          }

          const normalized = normalizePackageSearchError(error);
          setErrorMessage(normalized.globalMessage);
        })
        .finally(() => {
          if (requestSequenceRef.current !== requestId) {
            return;
          }

          currentControllerRef.current = null;
          setIsLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [term]);

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
