import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, CircularProgress } from '@mui/material';
import StatusMessage from '../StatusMessage';
import { ROUTES } from '../../config/routes';

const plural = (count) => (count === 1 ? '1 paquete válido' : `${count} paquetes válidos`);

/**
 * Acciones del paso 2: confirmar la importación y cargar otro archivo. Confirmar solo se ofrece si hay registros
 * válidos y el archivo está disponible (se pierde al recargar la página); si no, dice por qué. Muestra el error de la
 * confirmación y bloquea los botones mientras se envía.
 * @param {{ validCount: number, hasFile: boolean, isConfirming: boolean, errorMessage: string|null, severity: string,
 *   onConfirm: () => void, children?: import('react').ReactNode }} props Los `children` son acciones extra que
 *   van entre "Confirmar" y "Cargar otro archivo".
 */
export default function ImportConfirmActions({ validCount, hasFile, isConfirming, errorMessage, severity, onConfirm, children }) {
  const canConfirm = hasFile && validCount > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {!hasFile && (
        <StatusMessage severity="warning" message="Para confirmar la importación vuelve a cargar el archivo: la previsualización se perdió al recargar la página." />
      )}
      {errorMessage && <StatusMessage severity={severity} message={errorMessage} />}

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', '& a, & button': { width: { xs: '100%', sm: 'auto' } } }}>
        <Button variant="contained" onClick={onConfirm} disabled={!canConfirm || isConfirming} aria-busy={isConfirming}>
          {isConfirming ? (
            <>
              <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
              Importando…
            </>
          ) : (
            `Confirmar importación${validCount > 0 ? ` de ${plural(validCount)}` : ''}`
          )}
        </Button>
        {children}
        <Button component={RouterLink} to={ROUTES.PACKAGE_IMPORT} variant="outlined" disabled={isConfirming}>
          Cargar otro archivo
        </Button>
      </Box>
    </Box>
  );
}
