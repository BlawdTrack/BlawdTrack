import React, { useState } from 'react';
import { EditMessenger } from './pages/EditMessenger';

export default function App() {
  // Null so the spaces will appear in blank
  const [messengerData, setMessengerData] = useState(null);

  const handleSave = (updatedData) => {
    console.log('Enviando a API:', updatedData);
  };

  const handleDeactivate = () => {
    console.log('Desactivando mensajero...');
  };

  return (
    <EditMessenger
      messengerData={messengerData}
      onSave={handleSave}
      onDeactivate={handleDeactivate}
    />
  );
}