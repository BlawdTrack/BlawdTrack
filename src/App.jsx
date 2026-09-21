import React from 'react';
import AdminManagement from './pages/AdminManagement';
import CourierRegistrationPage from './pages/CourierRegistrationPage';
import NewPasswordPage from './pages/NewPasswordPage.jsx';

// TODO: Definir un router para navegar entre pantallas.
function App() {
  return (
    <div>
      {/* Vista de Administradores (HU008) */}
      <AdminManagement />

      <hr style={{ margin: '40px 0', border: '1px solid #ccc' }} />

      {/* Vista de Registro de Mensajeros (HU003) */}
      <CourierRegistrationPage />

      <hr style={{ margin: '40px 0', border: '1px solid #ccc' }} />

      {/* Vista de Nueva Contraseña (HU002 - tarea #66) */}
      <NewPasswordPage />
    </div>
  );
}

export default App;