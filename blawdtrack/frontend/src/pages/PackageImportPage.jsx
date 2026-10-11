import { useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import PageContainer from '../components/PageContainer';
import PageHeaderBar from '../components/PageHeaderBar';
import StatusMessage from '../components/StatusMessage';
import ImportSteps from '../components/import/ImportSteps';
import PackageFileUploadForm from '../components/import/PackageFileUploadForm';
import { usePackageFileUpload } from '../hooks/usePackageFileUpload';
import { ROUTES } from '../config/routes';

/**
 * Importar paquetes, paso 1 (HU-010): el usuario elige el archivo de Zoho Inventory (.xlsx o .csv), el navegador
 * valida su formato y el backend lo lee sin registrarlo. Muestra los estados de la carga: cargando, error (del
 * formato o del servidor) y éxito. Con éxito entrega la previsualización a la pantalla de previsualización (paso 2) por
 * el estado de navegación. Solo compone: la selección y la carga viven en sus hooks, el diseño en `components/import`.
 */
export default function PackageImportPage() {
  const navigate = useNavigate();
  const upload = usePackageFileUpload();
  const { file, isSuccess, preview, discard } = upload;

  const handleContinue = () => navigate(ROUTES.PACKAGE_IMPORT_PREVIEW, { state: { preview } });

  return (
    <>
      <PageHeaderBar
        title="Importar paquetes"
        description="Carga el archivo de Zoho Inventory para validarlo antes de registrar los paquetes."
      />

      <PageContainer>
        <ImportSteps current={1} />

        {isSuccess ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <StatusMessage
              severity="success"
              title="Archivo cargado"
              message={`${preview?.fileName ?? file?.name ?? 'El archivo'}: ${preview?.totalRecords ?? 0} registros leídos. Revisa la previsualización antes de importar.`}
            />
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', '& a, & button': { width: { xs: '100%', sm: 'auto' } } }}>
              <Button variant="contained" onClick={handleContinue}>
                Ver previsualización
              </Button>
              <Button variant="outlined" onClick={discard}>
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
