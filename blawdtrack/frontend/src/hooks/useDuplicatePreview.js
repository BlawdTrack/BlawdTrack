import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { buildDuplicateReport } from '../utils/duplicateReport';

/**
 * Reporte de duplicados de la previsualización que muestra la pantalla. La previsualización llega en el estado de
 * navegación (`location.state.preview`), que es como la pantalla de importación le entregará la respuesta de
 * `POST /api/v1/packages/import/preview`.
 * @returns {{ report: object|null }} El reporte listo para mostrar, o `null` si no hay archivo en previsualización.
 */
export function useDuplicatePreview() {
  const { state } = useLocation();
  const preview = state?.preview ?? null;
  const report = useMemo(() => buildDuplicateReport(preview), [preview]);

  return { report };
}

export default useDuplicatePreview;
