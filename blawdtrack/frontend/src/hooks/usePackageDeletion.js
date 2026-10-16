import { useRef, useState } from 'react';
import { deletePackage } from '../services/PackageDeletionService';

/**
 * Resultado de un intento de eliminación. En un error, `status` y `code` vienen del backend; sin respuesta (error de
 * red) los dos son `null`.
 * @typedef {{ ok: true, paquete: object } | { ok: false, paquete: object, status: number|null, code: string|null }}
 *   PackageDeletionResult
 */

const toFailure = (paquete, error) => ({
  ok: false,
  paquete,
  status: error.response?.status ?? null,
  code: error.response?.data?.code ?? null,
});

/**
 * Eliminación de un paquete (HU-012): cuál está en confirmación, la llamada al backend y su resultado. No muestra
 * mensajes: quien lo usa decide qué hacer con el resultado (`onResult`, T07).
 * @param {{ onDeleted?: (paquete: object) => void, onResult?: (result: PackageDeletionResult) => void }} [options]
 *   `onDeleted` se llama cuando el backend confirma la eliminación; `onResult`, al terminar cada intento.
 * @returns {{ selected: object|null, isDeleting: boolean, open: (paquete: object) => void, close: Function,
 *   confirm: () => Promise<PackageDeletionResult|null> }} `confirm` devuelve `null` si no había nada que confirmar o
 *   si ya había una eliminación en curso.
 */
export function usePackageDeletion({ onDeleted, onResult } = {}) {
  const [selected, setSelected] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // El estado se actualiza un render después: la referencia bloquea un segundo clic inmediato.
  const inFlightRef = useRef(false);

  const open = (paquete) => {
    if (inFlightRef.current) return;
    setSelected(paquete);
  };

  const close = () => {
    if (inFlightRef.current) return;
    setSelected(null);
  };

  const confirm = async () => {
    if (!selected || inFlightRef.current) return null;

    const paquete = selected;
    inFlightRef.current = true;
    setIsDeleting(true);

    let result;
    try {
      await deletePackage(paquete.shipmentNumber);
      result = { ok: true, paquete };
    } catch (error) {
      result = toFailure(paquete, error);
    } finally {
      inFlightRef.current = false;
      setIsDeleting(false);
      setSelected(null);
    }

    if (result.ok) onDeleted?.(paquete);
    // T07 (#123) se conecta aquí: mensaje según `status`/`code` y recarga de la lista tras un 409 o un 404.
    onResult?.(result);
    return result;
  };

  return { selected, isDeleting, open, close, confirm };
}
