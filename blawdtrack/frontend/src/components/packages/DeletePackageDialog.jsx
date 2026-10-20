import { useId, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { FONT, RADIUS, rem } from '../../theme';

const ACTION_BUTTON_SX = { borderRadius: RADIUS.sm, px: 2.5, fontWeight: 600, fontSize: FONT.md };

/**
 * Confirmación antes de eliminar un paquete (HU-012). Es un `alertdialog`: el foco empieza en "Cancelar" (la opción
 * segura), queda atrapado dentro y vuelve al botón que lo abrió al cerrarse. "Cancelar", Esc o un clic fuera cierran
 * sin hacer nada. Mientras se elimina, "Sí, eliminar" muestra la carga, los dos botones quedan deshabilitados y no se
 * puede cerrar.
 * @param {{ pkg: { shipmentNumber: string, customerName: string, address: string }|null, isDeleting: boolean,
 *   onCancel: Function, onConfirm: Function, onClosed?: Function }} props Sin `pkg`, el diálogo está cerrado.
 *   `onClosed` se llama cuando terminó de cerrarse (por ejemplo, para mover el foco si el botón que lo abrió ya no
 *   existe).
 */
export default function DeletePackageDialog({ pkg, isDeleting, onCancel, onConfirm, onClosed }) {
  const titleId = useId();
  const descriptionId = useId();
  // Conserva el último paquete mientras el diálogo se desvanece al cerrarse, para que el contenido no desaparezca antes.
  const [shownPkg, setShownPkg] = useState(pkg);
  if (pkg && pkg !== shownPkg) {
    setShownPkg(pkg);
  }

  const handleClose = () => {
    if (!isDeleting) onCancel();
  };

  return (
    <Dialog
      open={Boolean(pkg)}
      onClose={handleClose}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      fullWidth
      slotProps={{
        transition: { onExited: onClosed },
        paper: { sx: { maxWidth: rem(470), p: { xs: 1, sm: 1.5 } } },
      }}
    >
      {shownPkg && (
        <>
          <DialogTitle id={titleId} sx={{ display: 'flex', alignItems: 'center', gap: 1.75, pb: 1.5 }}>
            <Box
              aria-hidden="true"
              sx={{
                flex: `0 0 ${rem(34)}`,
                width: rem(34),
                height: rem(34),
                borderRadius: '50%',
                bgcolor: 'error.light',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Box sx={{ width: '3px', height: '14px', bgcolor: 'error.main', borderRadius: '2px' }} />
            </Box>
            <Typography component="span" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: FONT.xl, color: 'primary.main' }}>
              Eliminar paquete
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ bgcolor: 'neutral.surface', borderRadius: RADIUS.sm, px: 2.5, py: 2.25 }}>
              <Typography sx={{ fontSize: FONT.md, fontWeight: 700, color: 'text.primary' }}>
                {shownPkg.shipmentNumber}
              </Typography>
              <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary', lineHeight: 1.45, mt: 0.5, overflowWrap: 'anywhere' }}>
                {shownPkg.customerName} · {shownPkg.address}
              </Typography>
            </Box>
            <Typography id={descriptionId} sx={{ fontSize: FONT.md, color: 'text.secondary', lineHeight: 1.55 }}>
              El paquete desaparece del sistema y de la lista visible para el mensajero. La acción queda en auditoría
              con fecha, hora y cuenta responsable.
            </Typography>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              autoFocus
              variant="outlined"
              onClick={onCancel}
              data-testid="delete-package-cancel"
              disabled={isDeleting}
              sx={{ ...ACTION_BUTTON_SX, color: 'primary.main', borderWidth: '1.5px', borderColor: 'neutral.borderStrong' }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={onConfirm}
              data-testid="delete-package-confirm"
              loading={isDeleting}
              loadingPosition="start"
              sx={{ ...ACTION_BUTTON_SX, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
            >
              Sí, eliminar
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
