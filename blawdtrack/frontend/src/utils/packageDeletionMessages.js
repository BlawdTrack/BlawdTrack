import { getPackageStatusMeta } from '../config/packageStatus';

/**
 * Textos de la eliminación de paquetes (HU-012), en un solo lugar: el resultado del backend y el aviso del botón no
 * eliminable. Los arma el frontend según `code` y estado HTTP; el `message` del backend nunca se muestra. Los avisos
 * de "no se puede eliminar" comparten la forma "El paquete {envío} {motivo}: ya no puede eliminarse.".
 * Cada función devuelve `{ message, severity }` para `useToast().notify`.
 */

const cannotDelete = (shipmentNumber, reason) => ({
  message: `El paquete ${shipmentNumber} ${reason}: ya no puede eliminarse.`,
  severity: 'warning',
});

const inStatus = (status) => `está en “${getPackageStatusMeta(status).label}”`;

const NOT_FOUND = (shipmentNumber) => ({ message: `El paquete ${shipmentNumber} ya no existe.`, severity: 'error' });

const FORBIDDEN = () => ({ message: 'No tienes permiso para eliminar paquetes.', severity: 'error' });

// Mensaje por `code` del backend (GlobalExceptionHandler / RestAccessDeniedHandler).
const MESSAGES_BY_CODE = {
  // El backend no dice en cuál de los estados despachados está (Enviado, En tránsito o No entregado); la nueva
  // consulta del paquete lo muestra en la ficha.
  PAQUETE_DESPACHADO: (shipmentNumber) => cannotDelete(shipmentNumber, 'ya salió a reparto'),
  PAQUETE_ENTREGADO: (shipmentNumber) => cannotDelete(shipmentNumber, inStatus('DELIVERED')),
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
  const { shipmentNumber } = result.pkg;

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
 * @param {{ shipmentNumber: string, status: string }} pkg
 * @returns {{ message: string, severity: 'warning' }}
 */
export const getBlockedPackageMessage = (pkg) => cannotDelete(pkg.shipmentNumber, inStatus(pkg.status));

/**
 * ¿Hay que volver a consultar el paquete después de este resultado? Sí tras un 409 o un 404: alguien más pudo
 * cambiar su estado o eliminarlo.
 * @param {import('../hooks/usePackageDeletion').PackageDeletionResult} result
 * @returns {boolean}
 */
export const shouldReloadAfter = (result) => !result.ok && (result.status === 409 || result.status === 404);
