// Reglas de negocio de la desactivación de un mensajero (HU-005), en un solo lugar para que la lista y el
// cuadro de confirmación digan siempre lo mismo.

/** Cuándo se puede desactivar a un mensajero (el backend lo hace cumplir con un 409). */
export const DEACTIVATION_CONDITION = 'Un mensajero solo puede desactivarse si está fuera de labores y sin envíos en proceso.';

/** Qué pasa después con lo que tenía pendiente. */
export const DEACTIVATION_REASSIGN = 'Sus paquetes pendientes deben reasignarse manualmente.';
