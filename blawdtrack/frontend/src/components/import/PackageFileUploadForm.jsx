import { Box } from '@mui/material';
import FormActions from '../FormActions';
import StatusMessage from '../StatusMessage';
import FileDropzone from './FileDropzone';
import SelectedFileCard from './SelectedFileCard';

/**
 * Formulario para elegir el archivo de paquetes y enviarlo a validar: zona de carga, archivo elegido, aviso de error
 * (del formato o del servidor) y botones. Es el mismo en la pantalla de importación y en la de duplicados.
 * @param {{ upload: ReturnType<import('../../hooks/usePackageFileUpload').usePackageFileUpload> }} props
 */
export default function PackageFileUploadForm({ upload }) {
  const { file, fileError, isUploading, errorMessage, severity, selectFile, discard, submit } = upload;
  const alertMessage = fileError ?? errorMessage;

  const handleSubmit = (event) => {
    event.preventDefault();
    submit();
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit} aria-busy={isUploading} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <FileDropzone onFile={selectFile} disabled={isUploading} />
      {file && <SelectedFileCard file={file} onRemove={discard} disabled={isUploading} />}
      {alertMessage && <StatusMessage severity={fileError ? 'error' : severity} message={alertMessage} />}
      <FormActions
        submitLabel="Cargar y validar"
        submittingLabel="Validando archivo…"
        isSubmitting={isUploading}
        submitDisabled={!file}
        onDiscard={discard}
      />
    </Box>
  );
}
