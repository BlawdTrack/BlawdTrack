import { Box, Button, CircularProgress, Typography } from '@mui/material';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import StatusMessage from '../StatusMessage';
import FileDropzone from './FileDropzone';
import ImportFileHelp from './ImportFileHelp';
import SelectedFileCard from './SelectedFileCard';
import { FONT, RADIUS } from '../../theme';

/**
 * Paso 1 de la importación: la zona para elegir el archivo, el archivo elegido, el aviso de error (si lo hay) y el pie
 * con "Cancelar", el estado de la selección y "Revisar datos". Es el cuerpo de un formulario: el botón principal envía
 * el formulario que lo contiene.
 * @param {{ file: File|null, alertMessage?: string|null, alertSeverity?: 'error'|'warning', isUploading: boolean,
 *   onFile: (file: File) => void, onRemove: () => void, onCancel: () => void }} props
 */
export default function ImportUploadStep({ file, alertMessage = null, alertSeverity = 'error', isUploading, onFile, onRemove, onCancel }) {
  return (
    <>
      <FileDropzone onFile={onFile} disabled={isUploading} />
      <ImportFileHelp />
      {file && <SelectedFileCard file={file} onRemove={onRemove} disabled={isUploading} />}
      {alertMessage && <StatusMessage severity={alertSeverity} message={alertMessage} />}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          pt: 2.5,
          borderTop: '1px solid',
          borderColor: 'neutral.border',
        }}
      >
        <Button type="button" variant="text" color="inherit" data-testid="import-cancel" onClick={onCancel} disabled={isUploading} sx={{ fontWeight: 700, color: 'text.secondary' }}>
          Cancelar
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: FONT.md, color: 'text.secondary' }}>{file ? '1 archivo seleccionado' : 'Ningún archivo seleccionado'}</Typography>
          <Button
            type="submit"
            variant="contained"
            data-testid="import-review"
            disabled={isUploading || !file}
            startIcon={isUploading ? null : <FactCheckOutlinedIcon />}
            sx={{ fontWeight: 700, minHeight: 48, px: 3, borderRadius: RADIUS.sm, boxShadow: 'none', gap: 1 }}
          >
            {isUploading ? (
              <>
                <CircularProgress size={18} color="inherit" />
                Validando archivo…
              </>
            ) : (
              'Revisar datos'
            )}
          </Button>
        </Box>
      </Box>
    </>
  );
}
