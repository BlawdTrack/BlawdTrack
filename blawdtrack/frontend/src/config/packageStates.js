/**
 * Estados en los que un paquete puede eliminarse (HU-012), con los mismos identificadores que el enum
 * `PackageStatus` del backend. Es una lista blanca, la misma que `PackageStatus.isDeletable()`: un estado nuevo no es
 * eliminable salvo que se agregue aquí. La etiqueta y los colores de cada estado viven en `config/packageStatus.js`.
 */
export const DELETABLE_PACKAGE_STATES = Object.freeze(new Set(['PENDING', 'ASSIGNED']));

/**
 * ¿Un paquete en este estado puede eliminarse?
 * @param {string} status Estado del paquete, tal como lo devuelve el backend.
 * @returns {boolean}
 */
export const isPackageDeletable = (status) => DELETABLE_PACKAGE_STATES.has(status);
