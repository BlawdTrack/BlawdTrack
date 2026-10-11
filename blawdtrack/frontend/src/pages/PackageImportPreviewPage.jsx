import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import EmptyState from '../components/EmptyState';
import PageContainer from '../components/PageContainer';
import PageHeaderBar from '../components/PageHeaderBar';
import ImportSteps from '../components/import/ImportSteps';
import ImportPreviewView from '../components/preview/ImportPreviewView';
import { useNavigationPreview } from '../hooks/useNavigationPreview';
import { buildImportPreview } from '../utils/importPreview';
import { ROUTES } from '../config/routes';

/**
 * Importar paquetes, paso 2 (HU-010): muestra al administrador, antes de importar, los registros que el backend
 * leyó del archivo: cuántos son válidos, cuáles tienen errores (y por qué) y cuáles están duplicados, con el rango
 * de entrega calculado de los válidos. Recibe la previsualización de la pantalla de carga; sin ella, el estado vacío.
 * Solo compone: el modelo lo arma `buildImportPreview` y el diseño vive en `components/preview`.
 */
export default function PackageImportPreviewPage() {
  const rawPreview = useNavigationPreview();
  const preview = useMemo(() => buildImportPreview(rawPreview), [rawPreview]);

  return (
    <>
      <PageHeaderBar
        title="Previsualización de la importación"
        description="Revisa los registros del archivo antes de importarlos: cuáles son válidos, cuáles tienen errores y cuáles están duplicados."
      />

      <PageContainer>
        <ImportSteps current={2} />

        {preview ? (
          <>
            <ImportPreviewView preview={preview} />
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', '& a': { width: { xs: '100%', sm: 'auto' } } }}>
              {preview.counts.duplicate > 0 && (
                <Button component={RouterLink} to={ROUTES.PACKAGE_DUPLICATES} state={{ preview: rawPreview }} variant="contained">
                  Ver detalle de duplicados
                </Button>
              )}
              <Button component={RouterLink} to={ROUTES.PACKAGE_IMPORT} variant="outlined">
                Cargar otro archivo
              </Button>
            </Box>
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
