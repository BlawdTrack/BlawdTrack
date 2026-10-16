import { useState } from 'react';
import { TEMPORARY_PACKAGES } from '../mocks/temporaryPackages';

/**
 * Lista de paquetes de la pantalla Eliminar paquetes (HU-012).
 *
 * TEMPORAL (T07 #123): HU-012 no tiene endpoint de listado, así que la fuente es el fixture de `mocks/` y `reload` no
 * puede pedirle la lista al backend. Mientras tanto conserva la lista de la sesión y quita el paquete que el backend
 * dijo que ya no existe (404), que es lo que mostraría una recarga real. Cuando `GET /v1/packages/search` (HU-014)
 * llegue a la rama, solo cambia el cuerpo de `reload` (y el estado inicial) para pedir la lista al backend.
 * @returns {{ paquetes: object[], removePackage: (shipmentNumber: string) => void,
 *   reload: (options?: { missingShipmentNumber?: string }) => void }}
 */
export function usePackageList() {
  const [paquetes, setPaquetes] = useState(TEMPORARY_PACKAGES);

  const removePackage = (shipmentNumber) => {
    setPaquetes((current) => current.filter((paquete) => paquete.shipmentNumber !== shipmentNumber));
  };

  const reload = ({ missingShipmentNumber } = {}) => {
    if (missingShipmentNumber) removePackage(missingShipmentNumber);
  };

  return { paquetes, removePackage, reload };
}
