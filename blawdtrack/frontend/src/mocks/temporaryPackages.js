import { PACKAGE_STATES } from '../config/packageStates';

/**
 * TEMPORAL (HU-012 T05 #121): paquetes de ejemplo para la pantalla Eliminar paquetes, los mismos del mockup del
 * Sprint 2, con la forma de `PackageSearchResponse` del backend. HU-012 todavía no tiene endpoint de listado: se quita
 * cuando `GET /v1/packages/search` (HU-014) llegue a la rama y la pantalla cargue los reales.
 */
export const TEMPORARY_PACKAGES = Object.freeze([
  { shipmentNumber: 'BG-2026-00121', customerName: 'Mariela Solís Gómez', address: 'Tibás, San José', status: PACKAGE_STATES.DELIVERED },
  { shipmentNumber: 'BG-2026-00122', customerName: 'Esteban Ramírez Vega', address: 'Heredia centro', status: PACKAGE_STATES.IN_TRANSIT },
  { shipmentNumber: 'BG-2026-00123', customerName: 'Gabriela Mora Pineda', address: 'Moravia, San José', status: PACKAGE_STATES.SHIPPED },
  { shipmentNumber: 'BG-2026-00124', customerName: 'Daniel Alvarado Cruz', address: 'San Isidro, Heredia', status: PACKAGE_STATES.ASSIGNED },
  { shipmentNumber: 'BG-2026-00125', customerName: 'Paola Herrera Sánchez', address: 'Atenas, Alajuela', status: PACKAGE_STATES.PENDING },
  { shipmentNumber: 'BG-2026-00126', customerName: 'Rodolfo Céspedes Mena', address: 'Escazú, San José', status: PACKAGE_STATES.NOT_DELIVERED },
  { shipmentNumber: 'BG-2026-00127', customerName: 'Verónica Pérez Alfaro', address: 'Santa Bárbara, Heredia', status: PACKAGE_STATES.PENDING },
]);
