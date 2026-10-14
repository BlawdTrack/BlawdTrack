import { useResourceRegistration } from './useResourceRegistration';
import { confirmPackageImport } from '../services/PackageImportService';
import { normalizePackageConfirmError } from '../utils/packageImportErrors';

/**
 * Confirmación de la importación y su resultado (estados: confirmando, error y éxito). Reutiliza la máquina de
 * estados de `useResourceRegistration`, igual que la carga del archivo.
 * @returns {{ isConfirming: boolean, isConfirmed: boolean, result: object|null, errorMessage: string|null,
 *   severity: string, confirm: (file: File) => Promise<{ ok: boolean }|null> }}
 */
export function usePackageImportConfirmation() {
  const { isSubmitting, isSuccess, successData, globalMessage, severity, register } = useResourceRegistration(
    confirmPackageImport,
    normalizePackageConfirmError
  );

  return {
    isConfirming: isSubmitting,
    isConfirmed: isSuccess,
    result: successData,
    errorMessage: globalMessage,
    severity,
    confirm: register,
  };
}

export default usePackageImportConfirmation;
