import { Box, Button, CircularProgress, Typography } from '@mui/material';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import StatusMessage from '../StatusMessage';
import { FONT, RADIUS } from '../../theme';

const plural = (count) => (count === 1 ? '1 paquete válido' : `${count} paquetes válidos`);

/**
 * Barra fija del paso 2: "Cambiar archivo" a la izquierda y, a la derecha, cuántos se importarán y cuántos quedan fuera
 * junto a "Confirmar importación". Confirmar solo se ofrece si hay registros válidos y el archivo está disponible; si no,
 * queda bloqueado. Muestra el error de la confirmación y bloquea los botones mientras se envía.
 * @param {{ validCount: number, excludedCount?: number, hasFile: boolean, isConfirming: boolean,
 *   errorMessage: string|null, severity: string, onConfirm: () => void, onLoadAnother: () => void }} props
 */
export default function ImportConfirmActions({ validCount, excludedCount = 0, hasFile, isConfirming, errorMessage, severity, onConfirm, onLoadAnother }) {
  const canConfirm = hasFile && validCount > 0;

  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        mt: 1.75,
        p: 2,
        bgcolor: 'background.paper',
        border: '1.5px solid',
        borderColor: 'neutral.border',
        borderRadius: RADIUS.sm,
        boxShadow: '0 -8px 20px -14px rgba(26, 60, 52, 0.3)',
      }}
    >
      {errorMessage && <StatusMessage severity={severity} message={errorMessage} />}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', '& button': { width: { xs: '100%', sm: 'auto' } } }}>
        <Button
          variant="outlined"
          onClick={onLoadAnother}
          disabled={isConfirming}
          startIcon={<FolderOpenOutlinedIcon />}
          data-testid="import-load-another"
          sx={{ fontWeight: 700, minHeight: 48, px: 3, borderRadius: RADIUS.sm }}
        >
          Cambiar archivo
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
          <Typography component="span" sx={{ fontSize: FONT.md, color: 'text.secondary' }}>
            <b>{validCount}</b> se importarán · <Box component="b" sx={{ color: excludedCount ? 'error.main' : 'inherit' }}>{excludedCount}</Box> {excludedCount === 1 ? 'queda fuera' : 'quedan fuera'}
          </Typography>
          <Button
            variant="contained"
            onClick={onConfirm}
            data-testid="import-confirm"
            disabled={!canConfirm || isConfirming}
            aria-busy={isConfirming}
            startIcon={isConfirming ? null : <FileUploadOutlinedIcon />}
            sx={{ fontWeight: 700, minHeight: 48, px: 3, borderRadius: RADIUS.sm, boxShadow: 'none', fontSize: FONT.md }}
          >
            {isConfirming ? (
              <>
                <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                Importando…
              </>
            ) : (
              `Confirmar importación${validCount > 0 ? ` de ${plural(validCount)}` : ''}`
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
