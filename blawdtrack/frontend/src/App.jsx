import React from 'react';
import { Container } from '@mui/material';
import { MessengerFleetList } from './components/MessengerFleetList'; // Ajusta tu ruta

function App() {
  return (
    <Container sx={{ mt: 6 }}>
      {/* Todo el flujo (Lista -> Modal -> Hook) está encapsulado aquí */}
      <MessengerFleetList />
    </Container>
  );
}

export default App;