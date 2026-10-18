import { useRef, useState } from 'react';
import { deletePackage } from '../services/PackageDeletionService';

/**
 * Resultado de un intento de eliminación. En un error, `status` y `code` vienen del backend; sin respuesta (error de
 * red) los dos son `null`.
 * @typedef {{ ok: true, pkg: object } | { ok: false, pkg: object, status: number|null, code: string|null }}
 *   PackageDeletionResult
 */

const toFailure = (pkg, error) => ({
  ok: false,
  pkg,
  status: error.response?.status ?? null,
  code: error.response?.data?.code ?? null,
});

/**
 * Eliminación de un paquete (HU-012): cuál está en confirmación, la llamada al backend y su resultado. No muestra
 * mensajes: quien lo usa decide qué hacer con el resultado (`onResult`, T07).
 * @param {{ onDeleted?: (pkg: object) => void, onResult?: (result: PackageDeletionResult) => void }} [options]
 *   `onDeleted` se llama cuando el backend confirma la eliminación; `onResult`, al terminar cada intento.
 * @returns {{ selected: object|null, isDeleting: boolean, open: (pkg: object) => void, close: Function,
 *   confirm: () => Promise<PackageDeletionResult|null> }} `confirm` devuelve `null` si no había nada que confirmar o
 *   si ya había una eliminación en curso.
 */
export function usePackageDeletion({ onDeleted, onResult } = {}) {
  const [selected, setSelected] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // El estado se actualiza un render después: la referencia bloquea un segundo clic inmediato.
  const inFlightRef = useRef(false);

  const open = (pkg) => {
    if (inFlightRef.current) return;
    setSelected(pkg);
  };

  const close = () => {
    if (inFlightRef.current) return;
    setSelected(null);
  };

  const confirm = async () => {
    if (!selected || inFlightRef.current) return null;

    const pkg = selected;
    inFlightRef.current = true;
    setIsDeleting(true);

    let result;
    try {
      await deletePackage(pkg.shipmentNumber);
      result = { ok: true, pkg };
    } catch (error) {
      result = toFailure(pkg, error);
    } finally {
      inFlightRef.current = false;
      setIsDeleting(false);
      setSelected(null);
    }

    if (result.ok) onDeleted?.(pkg);
    // T07 (#123) se conecta aquí: mensaje según `status`/`code` y nueva consulta del paquete tras un 409 o un 404.
    onResult?.(result);
    return result;
  };

  return { selected, isDeleting, open, close, confirm };
}
