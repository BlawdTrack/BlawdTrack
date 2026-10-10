import { useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import FormActions from '../components/FormActions';
import PageContainer from '../components/PageContainer';
import PageHeaderBar from '../components/PageHeaderBar';
import StatusMessage from '../components/StatusMessage';
import FileDropzone from '../components/import/FileDropzone';
import ImportSteps from '../components/import/ImportSteps';
import SelectedFileCard from '../components/import/SelectedFileCard';
import { usePackageFileSelection } from '../hooks/usePackageFileSelection';
import { usePackageImportPreview } from '../hooks/usePackageImportPreview';
import { ROUTES } from '../config/routes';

/**
 * Importar paquetes, paso 1 (HU-010): el usuario elige el archivo de Zoho Inventory (.xlsx o .csv), el navegador
 * valida su formato y el backend lo lee sin registrarlo. Muestra los estados de la carga: cargando, error (del
 * formato o del servidor) y éxito. Con éxito entrega la previsualización a la pantalla de previsualización (paso 2) por
 * el estado de navegación. Solo compone: la selección y la carga viven en sus hooks, el diseño en `components/import`.
 */
export default function PackageImportPage() {
  const navigate = useNavigate();
  const { file, error: fileError, select, clear } = usePackageFileSelection();
  const { isUploading, isSuccess, preview, errorMessage, severity, upload, reset } = usePackageImportPreview();

  const handleFile = (candidate) => {
    reset();
    select(candidate);
  };

  const handleDiscard = () => {
    reset();
    clear();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (file && !isUploading) upload(file);
  };

  const handleContinue = () => navigate(ROUTES.PACKAGE_IMPORT_PREVIEW, { state: { preview } });

  const alertMessage = fileError ?? errorMessage;

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
              <Button variant="outlined" onClick={handleDiscard}>
                Cargar otro archivo
              </Button>
            </Box>
          </Box>
        ) : (
          <Box component="form" noValidate onSubmit={handleSubmit} aria-busy={isUploading} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <FileDropzone onFile={handleFile} disabled={isUploading} />
            {file && <SelectedFileCard file={file} onRemove={handleDiscard} disabled={isUploading} />}
            {alertMessage && <StatusMessage severity={fileError ? 'error' : severity} message={alertMessage} />}
            <FormActions
              submitLabel="Cargar y validar"
              submittingLabel="Validando archivo…"
              isSubmitting={isUploading}
              submitDisabled={!file}
              onDiscard={handleDiscard}
            />
          </Box>
        )}
      </PageContainer>
    </>
  );
}
