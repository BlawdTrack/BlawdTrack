import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
} from '@mui/material';
import { getInitials } from '../utils/getInitials';
import { RADIUS, FONT, rem } from '../theme';

const CANCEL_SX = {
  color: 'primary.main',
  border: '1.5px solid',
  borderColor: 'neutral.borderStrong',
  borderRadius: RADIUS.sm,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: FONT.sm,
  px: 2.5,
};

const CONFIRM_SX = {
  bgcolor: 'error.main',
  color: 'common.white',
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: RADIUS.sm,
  px: 2.5,
  fontSize: FONT.sm,
  boxShadow: 'none',
  '&:hover': { bgcolor: 'error.dark', boxShadow: 'none' },
};

/**
 * Diálogo de confirmación de una acción destructiva (desactivar un mensajero, eliminar un administrador): título
 * con marca de alerta, tarjeta de la persona afectada, el contenido que explique la acción (`children`) y los
 * botones Cancelar / confirmar. Los dos modales de la app lo componen en vez de repetir esta estructura.
 * @param {{ open: boolean, onClose: Function, onConfirm: Function, title: string,
 *   subject: { name: string, detail: string }, confirmLabel: string, loadingLabel: string,
 *   isLoading?: boolean, children?: import('react').ReactNode }} props `subject` es la persona afectada;
 *   mientras `isLoading` no se puede cerrar ni confirmar de nuevo.
 */
export default function DestructiveConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  subject,
  confirmLabel,
  loadingLabel,
  isLoading = false,
  children,
}) {
  return (
    <Dialog
      open={open}
      onClose={!isLoading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: RADIUS.md, padding: { xs: 1, sm: 1.5 }, maxWidth: rem(480) } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box
          sx={{
            width: rem(28),
            height: rem(28),
            borderRadius: '50%',
            bgcolor: 'error.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: `0 0 ${rem(28)}`,
          }}
        >
          <Box sx={{ width: '3px', height: '14px', bgcolor: 'error.main', borderRadius: '2px' }} />
        </Box>
        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: FONT.md, color: 'primary.main' }}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.7308rem',
            p: '0.8462rem 1rem',
            bgcolor: 'neutral.surface',
            borderRadius: RADIUS.sm,
          }}
        >
          <Avatar sx={{ width: rem(30), height: rem(30), bgcolor: 'neutral.main', color: 'common.white', fontWeight: 700, fontSize: FONT.xs, flex: `0 0 ${rem(30)}` }}>
            {getInitials(subject.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: FONT.sm, fontWeight: 600, color: '#1F2421' }}>{subject.name}</Typography>
            <Typography sx={{ fontSize: FONT.xs, color: 'text.secondary' }}>{subject.detail}</Typography>
          </Box>
        </Box>
        {children}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1.5 }}>
        <Button onClick={onClose} disabled={isLoading} sx={CANCEL_SX} data-testid="confirm-dialog-cancel">
          Cancelar
        </Button>
        <Button onClick={onConfirm} disabled={isLoading} variant="contained" sx={CONFIRM_SX} data-testid="confirm-dialog-confirm">
          {isLoading ? loadingLabel : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
