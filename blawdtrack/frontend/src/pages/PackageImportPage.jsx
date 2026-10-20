import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import PageContainer from '../components/PageContainer';
import PageHeaderBar from '../components/PageHeaderBar';
import ImportSteps from '../components/import/ImportSteps';
import ImportUploadStep from '../components/import/ImportUploadStep';
import ImportConfirmActions from '../components/preview/ImportConfirmActions';
import ImportPreviewView from '../components/preview/ImportPreviewView';
import ImportResultView from '../components/preview/ImportResultView';
import { usePackageFileSelection } from '../hooks/usePackageFileSelection';
import { usePackageImportConfirmation } from '../hooks/usePackageImportConfirmation';
import { usePackageImportPreview } from '../hooks/usePackageImportPreview';
import { buildImportPreview } from '../utils/importPreview';
import { buildImportResult } from '../utils/importResult';
import { ROUTES } from '../config/routes';
import { RADIUS } from '../theme';

/**
 * Importar paquetes (HU-010): una sola pantalla con los tres pasos de la importación. En el paso 1 el usuario elige el
 * archivo de Zoho Inventory (.xlsx o .csv), el navegador valida su formato y el backend lo lee sin registrarlo; con
 * éxito, la misma pantalla pasa al paso 2 y muestra los registros leídos (válidos, con errores y duplicados) antes de
 * importar. Desde ahí el usuario confirma y el paso 3 ("Listo") muestra el resultado con la cantidad importada. Solo
 * compone: la selección, la carga y la confirmación viven en sus hooks, los modelos los arman `buildImportPreview` y
 * `buildImportResult`, y el diseño vive en `components/import` y `components/preview`.
 */
export default function PackageImportPage() {
  const navigate = useNavigate();
  const { file, error: fileError, select, clear } = usePackageFileSelection();
  const { isUploading, isSuccess, preview: rawPreview, errorMessage, severity, upload, reset } = usePackageImportPreview();
  const confirmation = usePackageImportConfirmation();
  const preview = useMemo(() => buildImportPreview(rawPreview), [rawPreview]);
  const result = useMemo(() => buildImportResult(confirmation.result), [confirmation.result]);
  const reviewing = isSuccess && preview && !result;

  const handleFile = (candidate) => {
    reset();
    select(candidate);
  };

  // Vuelve al paso 1 con la zona de carga vacía, venga del paso 2 o del 3.
  const handleDiscard = () => {
    reset();
    confirmation.reset();
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

  let step = 1;
  if (result) step = 3;
  else if (reviewing) step = 2;

  return (
    <>
      <PageHeaderBar title="Importar paquetes" />

      <PageContainer>
        <ImportSteps current={step} />

        {result && <ImportResultView result={result} onImportAnother={handleDiscard} />}

        {reviewing && (
          <>
            <ImportPreviewView preview={preview} />
            <ImportConfirmActions
              validCount={preview.counts.valid}
              excludedCount={preview.counts.invalid + preview.counts.duplicate}
              hasFile={Boolean(file)}
              isConfirming={confirmation.isConfirming}
              errorMessage={confirmation.errorMessage}
              severity={confirmation.severity}
              onConfirm={() => confirmation.confirm(file)}
              onLoadAnother={handleDiscard}
            />
          </>
        )}

        {!result && !reviewing && (
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
