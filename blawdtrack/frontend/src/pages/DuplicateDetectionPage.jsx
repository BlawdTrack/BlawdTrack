import { Box, Button } from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import EmptyState from '../components/EmptyState';
import PageContainer from '../components/PageContainer';
import PageHeaderBar from '../components/PageHeaderBar';
import DuplicateReportView from '../components/duplicates/DuplicateReportView';
import { useDuplicatePreview } from '../hooks/useDuplicatePreview';

/**
 * Detectar duplicados (HU-011): muestra, antes de confirmar una importación, qué paquetes del archivo ya están
 * registrados o se repiten en él, resaltados, con el total de válidos y de duplicados. Sin archivo en
 * previsualización muestra el estado vacío. Solo componen: los datos los arma `useDuplicatePreview` y el diseño vive
 * en `components/duplicates`.
 * @param {{ allowSample?: boolean }} props `allowSample` ofrece cargar una previsualización de ejemplo; solo en
 *   desarrollo, hasta que exista la pantalla de importación.
 */
export default function DuplicateDetectionPage({ allowSample = import.meta.env.DEV }) {
  const { report, loadSample } = useDuplicatePreview({ allowSample });

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
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <EmptyState
              icon={UploadFileOutlinedIcon}
              title="Sin archivo en previsualización"
              description="La detección de duplicados ocurre antes de confirmar una importación. Carga un archivo en la pantalla de importación para revisar los registros repetidos."
              sx={{ width: '100%' }}
            />
            {loadSample && (
              <Button variant="outlined" onClick={loadSample}>
                Cargar ejemplo (solo desarrollo)
              </Button>
            )}
          </Box>
        )}
      </PageContainer>
    </>
  );
}
