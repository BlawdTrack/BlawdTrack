import { useMemo } from 'react';
import { buildDuplicateReport } from '../utils/duplicateReport';
import { useNavigationPreview } from './useNavigationPreview';

/**
 * Reporte de duplicados de la previsualización que muestra la pantalla de duplicados. La previsualización llega por
 * el estado de navegación (ver `useNavigationPreview`).
 * @returns {{ report: object|null }} El reporte listo para mostrar, o `null` si no hay archivo en previsualización.
 */
export function useDuplicatePreview() {
  const preview = useNavigationPreview();
  const report = useMemo(() => buildDuplicateReport(preview), [preview]);

  return { report };
}

export default useDuplicatePreview;
