import React, { useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import DeactivateMessengerModal from './components/DeactivateMessengerModal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Objeto con la misma estructura que vendrá de la tabla o formulario real
  const mockMessenger = {
    id: '101',
    name: 'María José Solano',
    identification: '1-0345-0678',
    schedule: '6:00 am – 2:00 pm',
    pendingDeliveries: 3
  };

  const handleDeactivateSuccess = (deletedId) => {
    alert(`Backend respondió con éxito. Mensajero ID: ${deletedId} desactivado.`);
  };

  return (
    <Container sx={{ mt: 6, textAlign: 'center' }}>
      <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
        BlawdTrack - Pruebas de Desactivación (HU005)
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="error"
          size="large"
          sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
          onClick={() => setIsModalOpen(true)}
        >
          Probar Desactivación de Mensajero
        </Button>
      </Box>

      {/* Modal Desacoplado */}
      <DeactivateMessengerModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        messenger={mockMessenger}
        onSuccess={handleDeactivateSuccess}
      />
    </Container>
  );
}

export default App;