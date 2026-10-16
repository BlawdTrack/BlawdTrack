/**
 * Estados del ciclo de vida de un paquete, con los mismos identificadores que el enum `PackageStatus` del backend.
 * Flujo progresivo: Pendiente → Asignado → Enviado → En tránsito → Entregado / No entregado.
 */
export const PACKAGE_STATES = Object.freeze({
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  SHIPPED: 'SHIPPED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  NOT_DELIVERED: 'NOT_DELIVERED',
});

/** Nombre legible de cada estado, para mostrar en pantalla. */
export const PACKAGE_STATE_LABELS = Object.freeze({
  [PACKAGE_STATES.PENDING]: 'Pendiente',
  [PACKAGE_STATES.ASSIGNED]: 'Asignado',
  [PACKAGE_STATES.SHIPPED]: 'Enviado',
  [PACKAGE_STATES.IN_TRANSIT]: 'En tránsito',
  [PACKAGE_STATES.DELIVERED]: 'Entregado',
  [PACKAGE_STATES.NOT_DELIVERED]: 'No entregado',
});

/**
 * Colores del chip de cada estado (mockup del Sprint 2), con los tokens del tema donde coinciden. Asignado y Enviado
 * no tienen equivalente en `theme.js`, por eso van en hex.
 */
export const PACKAGE_STATE_COLORS = Object.freeze({
  [PACKAGE_STATES.PENDING]: { bg: 'neutral.surface', text: 'text.secondary' },
  [PACKAGE_STATES.ASSIGNED]: { bg: '#E6EFF4', text: '#1F5F7A' },
  [PACKAGE_STATES.SHIPPED]: { bg: '#FDECE0', text: '#A8450A' },
  [PACKAGE_STATES.IN_TRANSIT]: { bg: 'warning.light', text: 'warning.text' },
  [PACKAGE_STATES.DELIVERED]: { bg: 'success.light', text: 'success.text' },
  [PACKAGE_STATES.NOT_DELIVERED]: { bg: 'error.light', text: 'error.text' },
});

/**
 * Estados en los que un paquete puede eliminarse (HU-012). Es una lista blanca, la misma que
 * `PackageStatus.isDeletable()` en el backend: un estado nuevo no es eliminable salvo que se agregue aquí.
 */
export const DELETABLE_PACKAGE_STATES = Object.freeze(new Set([PACKAGE_STATES.PENDING, PACKAGE_STATES.ASSIGNED]));

/**
 * ¿Un paquete en este estado puede eliminarse?
 * @param {string} state Estado del paquete (`PACKAGE_STATES`).
 * @returns {boolean}
 */
export const isPackageDeletable = (state) => DELETABLE_PACKAGE_STATES.has(state);

/**
 * Nombre legible de un estado; si no se conoce, devuelve el valor tal cual.
 * @param {string} state Estado del paquete.
 * @returns {string}
 */
export const getPackageStateLabel = (state) => PACKAGE_STATE_LABELS[state] ?? state;
