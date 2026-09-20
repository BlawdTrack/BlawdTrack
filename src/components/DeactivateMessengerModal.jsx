import React from 'react';
import { useDeactivateMessenger } from '../hooks/useDeactivateMessenger'; // Ajusta la ruta

export const DeactivateMessengerModal = ({ isOpen, onClose, courier, onDeactivateSuccess }) => {
  const { deactivateMessenger, isLoading, error } = useDeactivateMessenger();

  if (!isOpen || !courier) return null;

  const handleConfirm = async () => {
    // Llamamos al hook pasando el ID real del mensajero
    const success = await deactivateMessenger(courier.id);
    
    if (success) {
      onDeactivateSuccess(); // Función para actualizar la tabla/lista en la vista principal
      onClose(); // Cerramos el modal
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>¿Desactivar mensajero?</h2>
        
        {/* Usamos los datos reales del objeto courier */}
        <p>Estás a punto de desactivar al mensajero <strong>{courier.user?.firstName} {courier.user?.lastName}</strong> con identificación <strong>{courier.nationalId}</strong>.</p>
        <p>No podrá iniciar sesión ni recibir nuevas rutas.</p>

        {error && <div className="error-message text-red-500">{error}</div>}

        <div className="modal-actions">
          <button onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button 
            onClick={handleConfirm} 
            disabled={isLoading}
            className="bg-red-600 text-white"
          >
            {isLoading ? 'Desactivando...' : 'Confirmar Desactivación'}
          </button>
        </div>
      </div>
    </div>
  );
};