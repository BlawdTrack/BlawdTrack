import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import PageContainer from '../components/PageContainer';
import PageHeaderBar from '../components/PageHeaderBar';
import ImportSteps from '../components/import/ImportSteps';
import ImportUploadStep from '../components/import/ImportUploadStep';
import ImportPreviewView from '../components/preview/ImportPreviewView';
import { usePackageFileSelection } from '../hooks/usePackageFileSelection';
import { usePackageImportPreview } from '../hooks/usePackageImportPreview';
import { buildImportPreview } from '../utils/importPreview';
import { ROUTES } from '../config/routes';
import { RADIUS } from '../theme';

/**
 * Importar paquetes (HU-010): una sola pantalla con los pasos de la importación. En el paso 1 el usuario elige el
 * archivo de Zoho Inventory (.xlsx o .csv), el navegador valida su formato y el backend lo lee sin registrarlo; con
 * éxito, la misma pantalla pasa al paso 2 y muestra los registros leídos (válidos, con errores y duplicados) antes de
 * importar. El paso 3 ("Listo") queda en el indicador hasta que exista la confirmación. Solo compone: la selección y
 * la carga viven en sus hooks, el modelo lo arma `buildImportPreview` y el diseño vive en `components/import` y
 * `components/preview`.
 */
export default function PackageImportPage() {
  const navigate = useNavigate();
  const { file, error: fileError, select, clear } = usePackageFileSelection();
  const { isUploading, isSuccess, preview: rawPreview, errorMessage, severity, upload, reset } = usePackageImportPreview();
  const preview = useMemo(() => buildImportPreview(rawPreview), [rawPreview]);
  const reviewing = isSuccess && preview;

  const handleFile = (candidate) => {
    reset();
    select(candidate);
  };

  const handleDiscard = () => {
    reset();
    clear();
  };

  const handleCancel = () => {
    handleDiscard();
    navigate(ROUTES.MAIN_MENU);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (file && !isUploading) upload(file);
  };

  return (
    <>
      <PageHeaderBar title="Importar paquetes" />

      <PageContainer>
        <ImportSteps current={reviewing ? 2 : 1} />

        {reviewing ? (
          <>
            <ImportPreviewView preview={preview} />
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', '& button': { width: { xs: '100%', sm: 'auto' } } }}>
              <Button variant="outlined" onClick={handleDiscard}>
                Cargar otro archivo
              </Button>
            </Box>
          </>
        ) : (
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            aria-busy={isUploading}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              p: { xs: 2, md: 4 },
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'neutral.border',
              borderRadius: RADIUS.lg,
            }}
          >
            <ImportUploadStep
              file={file}
              alertMessage={fileError ?? errorMessage}
              alertSeverity={fileError ? 'error' : severity}
              isUploading={isUploading}
              onFile={handleFile}
              onRemove={handleDiscard}
              onCancel={handleCancel}
            />
          </Box>
        )}
      </PageContainer>
    </>
  );
}
