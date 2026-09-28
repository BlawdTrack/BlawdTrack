import { ProvisionalHomePage } from '../components/ProvisionalHomePage';

// Inicio provisional para MENSAJERO (T12). La pantalla real llega con
// HU-022 (paquetes asignados al mensajero).
export function CourierHomePage() {
  return (
    <ProvisionalHomePage
      title="Panel del Mensajero"
      description="Pantalla provisional. Aquí irán tus paquetes asignados del día (HU-022)."
    />
  );
}

export default CourierHomePage;
