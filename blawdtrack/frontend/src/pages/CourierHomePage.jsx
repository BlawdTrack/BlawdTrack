import { ProvisionalHomePage } from '../components/ProvisionalHomePage';

// Inicio provisional para MENSAJERO (T12). La pantalla real llega con
// HU-022 (paquetes asignados al mensajero).
/** Inicio provisional del rol MENSAJERO; reutiliza `ProvisionalHomePage`. */
export function CourierHomePage() {
  return (
    <ProvisionalHomePage
      title="Panel del Mensajero"
      description="Muy pronto verás aquí los paquetes que tienes asignados para el día."
    />
  );
}

export default CourierHomePage;
