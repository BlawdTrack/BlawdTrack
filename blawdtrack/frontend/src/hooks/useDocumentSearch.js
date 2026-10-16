import { useState } from 'react';
import { normalizeDocument } from '../utils/documents';

/**
 * Búsqueda por tipo y número de documento sobre una lista ya cargada (la usan las pantallas de
 * mensajeros y de administradores). El filtro se aplica al pulsar "Buscar" y se quita con "Limpiar";
 * un número vacío equivale a quitarlo.
 * @param {(item: object) => unknown} [getDocumentNumber] Cómo leer el documento de cada elemento.
 */
export function useDocumentSearch(getDocumentNumber = (item) => item.documentNumber) {
  const [documentType, setDocumentType] = useState('CEDULA');
  const [documentNumber, setDocumentNumber] = useState('');
  const [applied, setApplied] = useState(null);

  const search = () => {
    const trimmed = documentNumber.trim();
    setApplied(trimmed ? { documentType, documentNumber: normalizeDocument(trimmed) } : null);
  };

  const clear = () => {
    setDocumentNumber('');
    setApplied(null);
  };

  const filter = (items) => (applied
    ? items.filter(
        (item) => item.documentType === applied.documentType
          && normalizeDocument(getDocumentNumber(item)).includes(applied.documentNumber)
      )
    : items);

  return {
    documentType,
    documentNumber,
    setDocumentType,
    setDocumentNumber,
    isFiltering: applied !== null,
    search,
    clear,
    filter,
  };
}
