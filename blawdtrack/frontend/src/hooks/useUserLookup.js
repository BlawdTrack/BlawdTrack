import { useState } from 'react';

/**
 * Campos de la búsqueda de un usuario por documento, con la forma que espera `DocumentSearch`. A diferencia
 * de `useDocumentSearch` no filtra una lista: al pulsar "Buscar" llama a `onFind(tipo, número)`.
 * @param {(documentType: string, documentNumber: string) => void} onFind
 */
export function useUserLookup(onFind) {
  const [documentType, setDocumentType] = useState('CEDULA');
  const [documentNumber, setDocumentNumber] = useState('');

  return {
    documentType,
    documentNumber,
    setDocumentType,
    setDocumentNumber,
    isFiltering: false,
    search: () => onFind(documentType, documentNumber),
    clear: () => setDocumentNumber(''),
  };
}
