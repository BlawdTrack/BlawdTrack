import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Alert,
} from '@mui/material';
import { getInitials } from '../utils/getInitials';
import { RADIUS, FONT } from '../theme';

/**
 * Diálogo de confirmación para eliminar un administrador (HU-008).
 * @param {{ open: boolean, onClose: Function, onConfirm: (documentType: string, documentNumber: string) => void,
 *   adminData: object|null, errorMessage?: string, isSubmitting?: boolean }} props `adminData` es el
 *   administrador seleccionado; sin él no se renderiza nada.
 */
const DeleteAdminModal = ({
  open,
  onClose,
  onConfirm,
  adminData,
  errorMessage,
  isSubmitting = false,
}) => {
  if (!adminData) return null;

  const documentNumber = adminData.documentNumber
    || adminData.identification
    || adminData.nationalId
    || adminData.id;

  return (
    <Dialog
      open={open}
      onClose={!isSubmitting ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: RADIUS.md, padding: { xs: 1, sm: 1.5 }, maxWidth: 480 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            bgcolor: 'error.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 28px',
          }}
        >
          <Box sx={{ width: '3px', height: '14px', bgcolor: 'error.main', borderRadius: '2px' }} />
        </Box>
        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: FONT.md, color: 'primary.main' }}>
          Eliminar administrador
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '9.5px',
            p: '11px 13px',
            bgcolor: 'neutral.surface',
            borderRadius: RADIUS.sm,
          }}
        >
          <Avatar sx={{ width: 30, height: 30, bgcolor: 'neutral.main', color: 'common.white', fontWeight: 700, fontSize: FONT.xs, flex: '0 0 30px' }}>
            {getInitials(adminData.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: FONT.sm, fontWeight: 600, color: '#1F2421' }}>
              {adminData.name}
            </Typography>
            <Typography sx={{ fontSize: FONT.xs, color: 'text.secondary' }}>
              {documentNumber} · {adminData.email}
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary', lineHeight: 1.55 }}>
          Esta acción es permanente. La cuenta pierde todos sus accesos de inmediato y queda
          registrada en auditoría con fecha, hora y responsable.
        </Typography>

        {adminData.hasActiveSession && (
          <Alert severity="warning" sx={{ borderRadius: RADIUS.sm, fontWeight: 500 }}>
            Este administrador tiene una sesión abierta. Se cerrará automáticamente al eliminarlo.
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ borderRadius: RADIUS.sm, fontWeight: 500 }}>
            {errorMessage}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            color: 'primary.main',
            border: '1.5px solid', borderColor: 'neutral.borderStrong',
            borderRadius: RADIUS.sm,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: FONT.sm,
            px: 2.5,
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={() => onConfirm(adminData.documentType, documentNumber)}
          disabled={isSubmitting}
          variant="contained"
          sx={{
            bgcolor: 'error.main',
            color: 'common.white',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: RADIUS.sm,
            px: 2.5,
            fontSize: FONT.sm,
            boxShadow: 'none',
            '&:hover': { bgcolor: 'error.dark', boxShadow: 'none' },
          }}
        >
          {isSubmitting ? 'Eliminando...' : 'Sí, eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAdminModal;
