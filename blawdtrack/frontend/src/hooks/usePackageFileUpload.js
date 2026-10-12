import { usePackageFileSelection } from './usePackageFileSelection';
import { usePackageImportPreview } from './usePackageImportPreview';

/**
 * Elegir el archivo de paquetes y enviarlo al backend para validarlo sin registrarlo. Junta la selección (con su
 * validación en el navegador) y la carga, que comparten las pantallas de importación y de detección de duplicados.
 * @returns {{ file: File|null, fileError: string|null, isUploading: boolean, isSuccess: boolean,
 *   preview: object|null, errorMessage: string|null, severity: string,
 *   selectFile: (candidate: File|null) => void, discard: () => void, submit: () => void }}
 */
export function usePackageFileUpload() {
  const { file, error: fileError, select, clear } = usePackageFileSelection();
  const { isUploading, isSuccess, preview, errorMessage, severity, upload, reset } = usePackageImportPreview();

  const selectFile = (candidate) => {
    reset();
    select(candidate);
  };

  const discard = () => {
    reset();
    clear();
  };

  const submit = () => {
    if (file && !isUploading) upload(file);
  };

  return { file, fileError, isUploading, isSuccess, preview, errorMessage, severity, selectFile, discard, submit };
}

export default usePackageFileUpload;
