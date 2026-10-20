import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import PageContainer from '../components/PageContainer';
import PageHeaderBar from '../components/PageHeaderBar';
import ImportSteps from '../components/import/ImportSteps';
import ImportUploadStep from '../components/import/ImportUploadStep';
import ImportConfirmActions from '../components/preview/ImportConfirmActions';
import ImportPreviewView from '../components/preview/ImportPreviewView';
import { usePackageFileSelection } from '../hooks/usePackageFileSelection';
import { usePackageImportConfirmation } from '../hooks/usePackageImportConfirmation';
import { usePackageImportPreview } from '../hooks/usePackageImportPreview';
import { buildImportPreview } from '../utils/importPreview';
import { buildImportResult, importResultNotice } from '../utils/importResult';
import { ROUTES } from '../config/routes';
import { RADIUS, rem } from '../theme';

// La tabla de revisión necesita más ancho que el resto de las pantallas para mostrar sus seis columnas completas.
const REVIEW_PAGE_SX = { maxWidth: rem(1280) };

/**
 * Importar paquetes (HU-010): una sola pantalla con los tres pasos de la importación. En el paso 1 el usuario elige el
 * archivo de Zoho Inventory (.xlsx o .csv), el navegador valida su formato y el backend lo lee sin registrarlo; con
 * éxito, la misma pantalla pasa al paso 2 y muestra los registros leídos (válidos, con errores y duplicados) antes de
 * importar. Desde ahí el usuario confirma y, al terminar, la pantalla lo lleva sola a "Consultar paquetes" con un aviso
 * de la cantidad importada. Solo compone: la selección, la carga y la confirmación viven en sus hooks, los modelos los arman `buildImportPreview` y
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

  // Con la importación hecha se pasa directo a la lista, que muestra el aviso con la cantidad registrada.
  useEffect(() => {
    if (result) navigate(ROUTES.PACKAGE_SEARCH, { replace: true, state: { notice: importResultNotice(result) } });
  }, [result, navigate]);

  const handleFile = (candidate) => {
    reset();
    select(candidate);
  };

  // Vuelve al paso 1 con la zona de carga vacía.
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

  const step = reviewing ? 2 : 1;

  return (
    <>
      <PageHeaderBar title="Importar paquetes" />

      <PageContainer sx={reviewing ? REVIEW_PAGE_SX : undefined}>
        <ImportSteps current={step} />

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
