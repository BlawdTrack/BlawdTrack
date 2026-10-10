import { useLocation } from 'react-router-dom';

/**
 * Previsualización de la importación que la pantalla anterior entregó por el estado de navegación
 * (`location.state.preview`, la respuesta de `POST /api/v1/packages/import/preview`).
 * @returns {object|null} La respuesta tal como llegó, o `null` si se entró a la pantalla sin pasar por la importación.
 */
export function useNavigationPreview() {
  const { state } = useLocation();
  return state?.preview ?? null;
}

export default useNavigationPreview;
