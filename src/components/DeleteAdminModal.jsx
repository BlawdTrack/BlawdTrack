import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  IconButton
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';

const DeleteAdminModal = ({ open, onClose, onConfirm, adminData }) => {
  if (!adminData) return null;

  // Extraemos las iniciales para el Avatar (ej. "Luis Diego Araya" -> "LD")
  const getInitials = (name) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: '#ffffff'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#212121', fontWeight: 'bold' }}>
        <WarningAmberIcon sx={{ color: '#ff6b00' }} />
        Eliminar administrador
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: '#666666',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ borderTop: 'none', borderBottom: 'none', pb: 1 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3, 
            p: 2, 
            bgcolor: '#f4f3ef', // Blanco hueso neutro
            borderRadius: 2 
          }}
        >
          <Avatar sx={{ bgcolor: '#e0e0e0', color: '#666666', fontWeight: 'bold' }}>
            {getInitials(adminData.name)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" color="#212121" lineHeight={1.2}>
              {adminData.name}
            </Typography>
            <Typography variant="body2" color="#666666">
              {adminData.identification || adminData.id} - {adminData.email}
            </Typography>
          </Box>
        </Box>
        
        <DialogContentText sx={{ color: '#212121', fontSize: '0.95rem' }}>
          Esta acción es permanente. La cuenta pierde todos sus accesos de inmediato y queda registrada en auditoría con fecha, hora y responsable.
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ 
            color: '#212121', 
            borderColor: '#cccccc',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            '&:hover': {
              borderColor: '#666666',
              bgcolor: '#f4f3ef'
            }
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={() => onConfirm(adminData.identification || adminData.nationalId)}
          variant="contained"
          disableElevation
          sx={{
            bgcolor: '#d32f2f', // Usamos un rojo estándar para acciones destructivas como en el video, o se puede cambiar por el accent #ff6b00
            color: '#ffffff',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            '&:hover': { 
              bgcolor: '#c62828' 
            }
          }}
        >
          Sí, eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAdminModal;