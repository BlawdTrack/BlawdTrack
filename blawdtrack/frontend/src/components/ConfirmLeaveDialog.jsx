import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

/**
 * Aviso de que hay cambios sin guardar antes de salir de lo que se está editando (cambiar de elemento,
 * ir a otra función o cerrar la pestaña). "Seguir editando" es la acción por defecto; salir exige
 * confirmarlo (prevención de errores).
 * @param {{ open: boolean, onStay: Function, onLeave: Function }} props
 */
export default function ConfirmLeaveDialog({ open, onStay, onLeave }) {
  return (
    <Dialog
      open={open}
      onClose={onStay}
      aria-labelledby="confirm-leave-title"
      aria-describedby="confirm-leave-description"
      slotProps={{ paper: { sx: { borderRadius: '16px', p: 1, maxWidth: 440 } } }}
    >
      <DialogTitle id="confirm-leave-title" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'primary.main' }}>
        ¿Salir sin guardar?
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-leave-description" sx={{ fontSize: 16 }}>
          Hiciste cambios que todavía no se han guardado. Si sales ahora, se perderán.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={onLeave} sx={{ color: '#C0392B', fontWeight: 600 }}>
          Salir sin guardar
        </Button>
        <Button onClick={onStay} variant="contained" autoFocus sx={{ fontWeight: 600 }}>
          Seguir editando
        </Button>
      </DialogActions>
    </Dialog>
  );
}
