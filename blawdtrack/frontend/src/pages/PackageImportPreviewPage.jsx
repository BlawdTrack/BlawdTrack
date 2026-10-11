import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import EmptyState from '../components/EmptyState';
import PageContainer from '../components/PageContainer';
import PageHeaderBar from '../components/PageHeaderBar';
import ImportSteps from '../components/import/ImportSteps';
import ImportConfirmActions from '../components/preview/ImportConfirmActions';
import ImportPreviewView from '../components/preview/ImportPreviewView';
import ImportResultView from '../components/preview/ImportResultView';
import { useNavigationFile, useNavigationPreview } from '../hooks/useNavigationPreview';
import { usePackageImportConfirmation } from '../hooks/usePackageImportConfirmation';
import { buildImportPreview } from '../utils/importPreview';
import { buildImportResult } from '../utils/importResult';
import { ROUTES } from '../config/routes';

/**
 * Importar paquetes, pasos 2 y 3 (HU-010): muestra al administrador, antes de importar, los registros que el backend
 * leyó del archivo: cuántos son válidos, cuáles tienen errores (y por qué) y cuáles están duplicados, con el rango
 * de entrega calculado de los válidos. Recibe la previsualización de la pantalla de carga; sin ella, el estado vacío.
 * El administrador confirma desde aquí; al terminar muestra el resultado (paso 3) con la cantidad importada.
 * Solo compone: los modelos los arman `buildImportPreview` y `buildImportResult`, la confirmación vive en
 * `usePackageImportConfirmation` y el diseño en `components/preview`.
 */
export default function PackageImportPreviewPage() {
  const rawPreview = useNavigationPreview();
  const file = useNavigationFile();
  const preview = useMemo(() => buildImportPreview(rawPreview), [rawPreview]);
  const confirmation = usePackageImportConfirmation();
  const result = useMemo(() => buildImportResult(confirmation.result), [confirmation.result]);

  return (
    <>
      <PageHeaderBar
        title={result ? 'Resultado de la importación' : 'Previsualización de la importación'}
        description={
          result
            ? 'Estos son los paquetes que se registraron con el archivo que confirmaste.'
            : 'Revisa los registros del archivo antes de importarlos: cuáles son válidos, cuáles tienen errores y cuáles están duplicados.'
        }
      />

      <PageContainer>
        <ImportSteps current={result ? 3 : 2} />

        {result ? (
          <ImportResultView result={result} />
        ) : preview ? (
          <>
            <ImportPreviewView preview={preview} />
            <ImportConfirmActions
              validCount={preview.counts.valid}
              hasFile={Boolean(file)}
              isConfirming={confirmation.isConfirming}
              errorMessage={confirmation.errorMessage}
              severity={confirmation.severity}
              onConfirm={() => confirmation.confirm(file)}
            >
              {preview.counts.duplicate > 0 && (
                <Button component={RouterLink} to={ROUTES.PACKAGE_DUPLICATES} state={{ preview: rawPreview }} variant="outlined">
                  Ver detalle de duplicados
                </Button>
              )}
            </ImportConfirmActions>
          </>
        ) : (
          <EmptyState
            icon={UploadFileOutlinedIcon}
            title="Sin archivo en previsualización"
            description="Carga un archivo en la pantalla de importación para ver aquí sus registros antes de importarlos."
          >
            <Button component={RouterLink} to={ROUTES.PACKAGE_IMPORT} variant="contained" sx={{ mt: 1 }}>
              Ir a importar paquetes
            </Button>
          </EmptyState>
        )}
      </PageContainer>
    </>
  );
}
