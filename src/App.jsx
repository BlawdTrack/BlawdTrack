import React from 'react';
import AdminManagement from './pages/AdminManagement';
import CourierRegistrationPage from './pages/CourierRegistrationPage';
import AdminRegistrationPage from './pages/AdminRegistrationPage.jsx';

// TODO: Definir un router para navegar entre pantallas.
// Estas vistas se muestran juntas temporalmente para pruebas.
function App() {
  return (
    <div>
      {/* Vista de Administradores (HU008) */}
      <AdminManagement />

      <hr style={{ margin: '40px 0', border: '1px solid #ccc' }} />

      {/* Vista de Registro de Mensajeros (HU003) */}
      <CourierRegistrationPage />

      <hr style={{ margin: '40px 0', border: '1px solid #ccc' }} />

      {/* Vista de Registro de Administrador (HU006) */}
      <AdminRegistrationPage />
    </div>
  );
}

export default App;