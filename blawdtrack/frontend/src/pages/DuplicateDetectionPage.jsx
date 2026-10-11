import { Link as RouterLink } from 'react-router-dom';
import { Button } from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import EmptyState from '../components/EmptyState';
import PageContainer from '../components/PageContainer';
import PageHeaderBar from '../components/PageHeaderBar';
import DuplicateReportView from '../components/duplicates/DuplicateReportView';
import { useDuplicatePreview } from '../hooks/useDuplicatePreview';
import { ROUTES } from '../config/routes';

/**
 * Detectar duplicados (HU-011): la persona carga el archivo de Zoho Inventory y el backend revisa, sin registrarlo,
 * qué paquetes ya están registrados o se repiten en él. Muestra los estados de la carga (cargando y error) y, con
 * el resultado, el aviso, los totales de válidos y duplicados y los registros resaltados. También recibe la
 * previsualización de la pantalla de importación. Solo compone: los datos los arma `useDuplicatePreview` y el diseño
 * vive en `components/duplicates` y `components/import`.
 */
export default function DuplicateDetectionPage() {
  const { report, preview, upload, loadAnother } = useDuplicatePreview();

  return (
    <>
      <PageHeaderBar
        title="Detectar duplicados"
        description="Revisa los paquetes del archivo que ya existen o se repiten antes de confirmar la importación."
      />

      <PageContainer>
        {report ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <DuplicateReportView report={report} />
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', '& a, & button': { width: { xs: '100%', sm: 'auto' } } }}>
              <Button component={RouterLink} to={ROUTES.PACKAGE_IMPORT_PREVIEW} state={{ preview }} variant="contained">
                Ver previsualización completa
              </Button>
              <Button variant="outlined" onClick={loadAnother}>
                Cargar otro archivo
              </Button>
            </Box>
          </Box>
        ) : (
          <PackageFileUploadForm upload={upload} />
        )}
      </PageContainer>
    </>
  );
}
