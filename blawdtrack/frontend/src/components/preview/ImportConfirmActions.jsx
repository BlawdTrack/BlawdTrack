import { Box, Button, CircularProgress } from '@mui/material';
import StatusMessage from '../StatusMessage';
import { FONT, RADIUS } from '../../theme';

const plural = (count) => (count === 1 ? '1 paquete válido' : `${count} paquetes válidos`);

/**
 * Acciones del paso 2: confirmar la importación o cargar otro archivo. Confirmar solo se ofrece si hay registros
 * válidos y el archivo está disponible; si no, queda bloqueado. Muestra el error de la confirmación y bloquea los
 * botones mientras se envía.
 * @param {{ validCount: number, hasFile: boolean, isConfirming: boolean, errorMessage: string|null, severity: string,
 *   onConfirm: () => void, onLoadAnother: () => void }} props
 */
export default function ImportConfirmActions({ validCount, hasFile, isConfirming, errorMessage, severity, onConfirm, onLoadAnother }) {
  const canConfirm = hasFile && validCount > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {errorMessage && <StatusMessage severity={severity} message={errorMessage} />}

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', '& button': { width: { xs: '100%', sm: 'auto' } } }}>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={!canConfirm || isConfirming}
          aria-busy={isConfirming}
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
        <Button variant="outlined" onClick={onLoadAnother} disabled={isConfirming}>
          Cargar otro archivo
        </Button>
      </Box>
    </Box>
  );
}
