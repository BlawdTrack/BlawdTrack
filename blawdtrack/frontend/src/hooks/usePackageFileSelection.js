import { useState } from 'react';
import { validatePackageFile } from '../utils/packageFile';

/**
 * Archivo elegido para la importación y su validación en el navegador. Un archivo no válido no queda
 * seleccionado: se descarta y se guarda el motivo para mostrarlo.
 * @returns {{ file: File|null, error: string|null, select: (candidate: File|null) => boolean, clear: () => void }}
 *   `select` devuelve `true` si el archivo quedó seleccionado.
 */
export function usePackageFileSelection() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const select = (candidate) => {
    const problem = validatePackageFile(candidate);
    setFile(problem ? null : candidate);
    setError(problem);
    return !problem;
  };

  const clear = () => {
    setFile(null);
    setError(null);
  };

  return { file, error, select, clear };
}

export default usePackageFileSelection;
