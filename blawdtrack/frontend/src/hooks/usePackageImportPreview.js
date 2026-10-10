import { useResourceRegistration } from './useResourceRegistration';
import { previewPackageImport } from '../services/PackageImportService';
import { normalizePackageImportError } from '../utils/packageImportErrors';

/**
 * Carga del archivo de paquetes al backend y su resultado (estados: cargando, error y éxito). Reutiliza la
 * máquina de estados de `useResourceRegistration`, igual que el registro de mensajeros y de administradores.
 * @returns {{ isUploading: boolean, isSuccess: boolean, preview: object|null, errorMessage: string|null,
 *   severity: string, upload: (file: File) => Promise<{ ok: boolean }|null>, reset: () => void }}
 */
export function usePackageImportPreview() {
  const { isSubmitting, isSuccess, successData, globalMessage, severity, register, reset } = useResourceRegistration(
    previewPackageImport,
    normalizePackageImportError
  );

  return {
    isUploading: isSubmitting,
    isSuccess,
    preview: successData,
    errorMessage: globalMessage,
    severity,
    upload: register,
    reset,
  };
}

export default usePackageImportPreview;
