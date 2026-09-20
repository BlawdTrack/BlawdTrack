import React from 'react';
import AdminManagement from './pages/AdminManagement';
import CourierRegistrationPage from './pages/CourierRegistrationPage';

// TODO: Falta definir un router (ej. react-router-dom) para navegar entre pantallas.
// Temporalmente se renderizan ambas pantallas para pruebas de UI (HU008 y HU003).
function App() {
  return (
    <div>
      {/* Vista de Administradores (HU008) */}
      <AdminManagement />
      
      <hr style={{ margin: '40px 0', border: '1px solid #ccc' }} />
      
      {/* Vista de Registro de Mensajeros (HU003) */}
      <CourierRegistrationPage />
    </div>
  );
}

export default App;
