import { ProvisionalHomePage } from '../components/ProvisionalHomePage';

// Inicio provisional para ADMIN_VENTAS (T12). La pantalla real llega con
// HU-010 en adelante (gestión de paquetes).
/** Inicio provisional del rol ADMIN_VENTAS; reutiliza `ProvisionalHomePage`. */
export function SalesHomePage() {
  return (
    <ProvisionalHomePage
      title="Panel de Ventas"
      description="Muy pronto podrás gestionar aquí los paquetes, las asignaciones y los reportes."
    />
  );
}

export default SalesHomePage;
