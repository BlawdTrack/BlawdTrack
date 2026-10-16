import { getPackageStateLabel } from '../config/packageStates';

/**
 * Textos de la eliminación de paquetes (HU-012), en un solo lugar: el resultado del backend y el aviso del botón no
 * eliminable. Los arma el frontend según `code` y estado HTTP; el `message` del backend nunca se muestra.
 * Cada función devuelve `{ message, severity }` para `useToast().notify`.
 */

const NOT_FOUND = (shipmentNumber) => ({
  message: `El paquete ${shipmentNumber} ya no existe. La lista se actualizó.`,
  severity: 'error',
});

const FORBIDDEN = () => ({ message: 'No tienes permiso para eliminar paquetes.', severity: 'error' });

// Mensaje por `code` del backend (GlobalExceptionHandler / RestAccessDeniedHandler).
const MESSAGES_BY_CODE = {
  PAQUETE_DESPACHADO: (shipmentNumber) => ({
    message: `El paquete ${shipmentNumber} ya fue despachado y no puede eliminarse.`,
    severity: 'warning',
  }),
  PAQUETE_ENTREGADO: (shipmentNumber) => ({
    message: `El paquete ${shipmentNumber} ya fue entregado y no puede eliminarse.`,
    severity: 'warning',
  }),
  PAQUETE_NO_ENCONTRADO: NOT_FOUND,
  // El 403 llega con un code u otro según dónde lo corte el backend: el filtro de seguridad o @PreAuthorize.
  ACCESS_DENIED: FORBIDDEN,
  ACCESO_DENEGADO: FORBIDDEN,
};

// Si el `code` no se reconoce, se decide por el estado HTTP, para que nunca falte un mensaje.
const MESSAGES_BY_STATUS = {
  409: (shipmentNumber) => ({ message: `El paquete ${shipmentNumber} ya no puede eliminarse.`, severity: 'warning' }),
  404: NOT_FOUND,
  403: FORBIDDEN,
};

const GENERIC_ERROR = { message: 'No se pudo eliminar el paquete. Intenta de nuevo.', severity: 'error' };

/**
 * Mensaje del resultado de una eliminación (`usePackageDeletion`).
 * @param {import('../hooks/usePackageDeletion').PackageDeletionResult} result
 * @returns {{ message: string, severity: 'success'|'warning'|'error' }|null} `null` en un 401: la sesión vencida la
 *   atiende el flujo de sesión (interceptor de `axiosClient`).
 */
export function getDeletionResultMessage(result) {
  const { shipmentNumber } = result.paquete;

  if (result.ok) {
    return { message: `Paquete ${shipmentNumber} eliminado correctamente.`, severity: 'success' };
  }
  if (result.status === 401) return null;

  const byCode = MESSAGES_BY_CODE[result.code];
  if (byCode) return byCode(shipmentNumber);

  const byStatus = MESSAGES_BY_STATUS[result.status];
  return byStatus ? byStatus(shipmentNumber) : GENERIC_ERROR;
}

/**
 * Aviso al pulsar "Eliminar" en un paquete que ya no puede eliminarse (botón gris de T05).
 * @param {{ shipmentNumber: string, status: string }} paquete
 * @returns {{ message: string, severity: 'warning' }}
 */
export function getBlockedPackageMessage(paquete) {
  return {
    message: `El paquete ${paquete.shipmentNumber} está en “${getPackageStateLabel(paquete.status)}”: ya no puede eliminarse.`,
    severity: 'warning',
  };
}

/**
 * ¿Hay que volver a cargar la lista después de este resultado? Sí tras un 409 o un 404: alguien más pudo cambiar el
 * estado del paquete o eliminarlo.
 * @param {import('../hooks/usePackageDeletion').PackageDeletionResult} result
 * @returns {boolean}
 */
export const shouldReloadAfter = (result) => !result.ok && (result.status === 409 || result.status === 404);
