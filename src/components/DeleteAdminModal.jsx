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

const DeleteAdminModal = ({
  open,
  onClose,
  onConfirm,
  adminData,
  errorMessage,
  isSubmitting = false,
}) => {
  if (!adminData) return null;

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

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
      PaperProps={{ sx: { borderRadius: '18px', padding: { xs: 1, sm: 1.5 } } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            bgcolor: '#FCEDEA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 34px',
          }}
        >
          <Box sx={{ width: '3px', height: '14px', bgcolor: '#C0392B', borderRadius: '2px' }} />
        </Box>
        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '17px', color: 'primary.main' }}>
          Eliminar administrador
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            p: '14px 16px',
            bgcolor: '#F1ECE7',
            borderRadius: '12px',
          }}
        >
          <Avatar sx={{ width: 38, height: 38, bgcolor: '#9E968D', color: '#fff', fontWeight: 700, fontSize: '12.5px', flex: '0 0 38px' }}>
            {getInitials(adminData.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: '#1F2421' }}>
              {adminData.name}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#6B6560' }}>
              {documentNumber} · {adminData.email}
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ fontSize: '13.5px', color: '#6B6560', lineHeight: 1.55 }}>
          Esta acción es permanente. La cuenta pierde todos sus accesos de inmediato y queda
          registrada en auditoría con fecha, hora y responsable.
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ borderRadius: '10px', fontWeight: 500 }}>
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
            border: '1.5px solid #DCD4CA',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '14px',
            px: 2.5,
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={() => onConfirm(documentNumber)}
          disabled={isSubmitting}
          variant="contained"
          sx={{
            bgcolor: '#C0392B',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '10px',
            px: 2.5,
            fontSize: '14px',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#A5301F', boxShadow: 'none' },
          }}
        >
          {isSubmitting ? 'Eliminando...' : 'Sí, eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAdminModal;
