import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
  DEFAULT_PAGE,
  SEARCH_DEBOUNCE_MS,
  SEARCH_PAGE_SIZE,
} from '../config/packageSearch';
import { searchPackages } from '../services/PackageService';
import { normalizePackageSearchError } from '../utils/packageSearchErrors';
import { normalizeSearchTerm } from '../utils/packageSearchTerm';

/**
 * Orquesta la búsqueda en vivo de paquetes con debounce, cancelación y manejo de errores.
 * @returns {{ term: string, setTerm: Function, results: object|null, isLoading: boolean, errorMessage: string|null }}
 */
export function usePackageSearch() {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState(null);
  const [distributionResults, setDistributionResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const distributionControllerRef = useRef(null);
  const currentControllerRef = useRef(null);
  const lastRequestedTermRef = useRef(null);
  const requestSequenceRef = useRef(0);

  const cancelCurrentRequest = () => {
    if (currentControllerRef.current) {
      currentControllerRef.current.abort();
      currentControllerRef.current = null;
    }
  };

  const clearSearch = () => {
    cancelCurrentRequest();
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
        const cancelled = Boolean(
          axios.isCancel?.(error)
          || error?.code === 'ERR_CANCELED'
          || error?.name === 'CanceledError'
          || error?.message === 'canceled'
        );

        if (!cancelled) {
          setErrorMessage(normalizePackageSearchError(error).globalMessage);
        }
      });

    return () => {
      controller.abort();
      distributionControllerRef.current = null;
    };
  }, []);

  const effectiveResults = normalizeSearchTerm(term) ? results : distributionResults;

  useEffect(() => {
    const normalizedTerm = normalizeSearchTerm(term);

    if (!normalizedTerm) {
      cancelCurrentRequest();
      requestSequenceRef.current += 1;
      lastRequestedTermRef.current = null;
      return undefined;
    }

    if (normalizedTerm === lastRequestedTermRef.current) {
      return undefined;
    }

    cancelCurrentRequest();
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

          const cancelled = Boolean(
            axios.isCancel?.(error)
            || error?.code === 'ERR_CANCELED'
            || error?.name === 'CanceledError'
            || error?.message === 'canceled'
          );

          if (cancelled) {
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
  };
}

export default usePackageSearch;
