import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { buildDuplicateReport } from '../utils/duplicateReport';

// El ejemplo se importa solo al pedirlo: queda en un archivo aparte que en producción nunca se descarga.
const loadSamplePreview = () => import('../dev/duplicatePreviewSample').then((module) => module.DUPLICATE_PREVIEW_SAMPLE);

/**
 * Previsualización cuyos duplicados muestra la pantalla. Llega en el estado de navegación (`location.state.preview`),
 * que es como la pantalla de importación le entregará la respuesta de `POST /api/v1/packages/import/preview`.
 * Mientras esa pantalla no exista, en desarrollo se puede cargar una previsualización de ejemplo.
 * @param {{ allowSample?: boolean }} options `allowSample` habilita la carga del ejemplo (solo desarrollo).
 * @returns {{ report: object|null, loadSample: (() => void)|null }} El reporte listo para mostrar (o `null` si no
 *   hay archivo en previsualización) y la función que carga el ejemplo (o `null` si no está habilitada).
 */
export function useDuplicatePreview({ allowSample = false } = {}) {
  const { state } = useLocation();
  const [preview, setPreview] = useState(state?.preview ?? null);
  const report = useMemo(() => buildDuplicateReport(preview), [preview]);

  return {
    report,
    loadSample: allowSample ? () => loadSamplePreview().then(setPreview) : null,
  };
}

export default useDuplicatePreview;
