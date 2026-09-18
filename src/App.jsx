 import React from 'react';
import CourierRegistrationPage from './pages/CourierRegistrationPage';

// TODO: se resolvió este conflicto de merge quedándose con la pantalla de
// registro de mensajero (HU003). La pantalla de prueba de desactivación de
// mensajero (HU005, con DeactivateMessengerModal) quedó fuera de App.jsx
// temporalmente — falta definir un router (o navegación equivalente) para
// que ambas pantallas convivan. Revisar antes de continuar con más HUs de UI. importante muy importante
function App() {
  return (
    <div>
      <CourierRegistrationPage />
    </div>
  );
}

export default App;