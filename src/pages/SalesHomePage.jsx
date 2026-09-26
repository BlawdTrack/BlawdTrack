import { ProvisionalHomePage } from '../components/ProvisionalHomePage';

// Inicio provisional para ADMIN_VENTAS (T12). La pantalla real llega con
// HU-010 en adelante (gestión de paquetes).
export function SalesHomePage() {
  return (
    <ProvisionalHomePage
      title="Panel de Ventas"
      description="Pantalla provisional. Aquí irán los paquetes, asignaciones y reportes (HU-010 en adelante)."
    />
  );
}

export default SalesHomePage;
