import { useMemo, useState } from 'react';
import { buildDuplicateReport } from '../utils/duplicateReport';
import { useNavigationPreview } from './useNavigationPreview';
import { usePackageFileUpload } from './usePackageFileUpload';

/**
 * Reporte de duplicados que muestra la pantalla de duplicados. La previsualización sale del archivo que la persona
 * carga en la propia pantalla o, si no cargó ninguno, de la que entregó la pantalla anterior por el estado de
 * navegación (ver `useNavigationPreview`).
 * @returns {{ report: object|null, preview: object|null, upload: object, loadAnother: () => void }} `report` es
 *   `null` mientras no haya archivo: ahí se muestra el formulario de carga (`upload`). `loadAnother` descarta el
 *   reporte actual para cargar otro archivo.
 */
export function useDuplicatePreview() {
  const navigationPreview = useNavigationPreview();
  const upload = usePackageFileUpload();
  const [navigationDismissed, setNavigationDismissed] = useState(false);

  const preview = upload.preview ?? (navigationDismissed ? null : navigationPreview);
  const report = useMemo(() => buildDuplicateReport(preview), [preview]);

  const loadAnother = () => {
    upload.discard();
    setNavigationDismissed(true);
  };

  return { report, preview, upload, loadAnother };
}

export default useDuplicatePreview;
