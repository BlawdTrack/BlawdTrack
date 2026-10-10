import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import EmptyState from '../components/EmptyState';
import PageContainer from '../components/PageContainer';
import PageHeaderBar from '../components/PageHeaderBar';
import DuplicateReportView from '../components/duplicates/DuplicateReportView';
import { useDuplicatePreview } from '../hooks/useDuplicatePreview';

/**
 * Detectar duplicados (HU-011): muestra, antes de confirmar una importación, qué paquetes del archivo ya están
 * registrados o se repiten en él, resaltados, con el total de válidos y de duplicados. Sin archivo en
 * previsualización muestra el estado vacío. Solo compone: los datos los arma `useDuplicatePreview` y el diseño vive
 * en `components/duplicates`.
 */
export default function DuplicateDetectionPage() {
  const { report } = useDuplicatePreview();

  return (
    <>
      <PageHeaderBar
        title="Detectar duplicados"
        description="Revisa los paquetes del archivo que ya existen o se repiten antes de confirmar la importación."
      />

      <PageContainer>
        {report ? (
          <DuplicateReportView report={report} />
        ) : (
          <EmptyState
            icon={UploadFileOutlinedIcon}
            title="Sin archivo en previsualización"
            description="La detección de duplicados ocurre antes de confirmar una importación. Carga un archivo en la pantalla de importación para revisar los registros repetidos."
          />
        )}
      </PageContainer>
    </>
  );
}
