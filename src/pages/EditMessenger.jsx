import React, { useState, useEffect } from 'react';
import './EditMessenger.css';

export const EditMessenger = ({
  messengerData = null,
  onSave,
  onDeactivate,
  isSaving = false
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    horario: '',
    capacidadCarga: ''
  });

  // Se llena solo cuando messengerData tiene información del backend
  useEffect(() => {
    if (messengerData) {
      setFormData({
        nombre: messengerData.nombre || '',
        horario: messengerData.horario || '',
        capacidadCarga: messengerData.capacidadCarga || ''
      });
    }
  }, [messengerData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <div className="bt-layout">
      <div className="bt-top-accent-bar"></div>

      <aside className="bt-sidebar">
        <div className="bt-brand">
          <div className="bt-logo-badge">
            <span className="bt-logo-icon">B</span>
          </div>
          <h1 className="bt-brand-title">BlawdTrack</h1>
        </div>

        <nav className="bt-desktop-menu">
          <button type="button" className="bt-menu-item">Dashboard</button>
          <button type="button" className="bt-menu-item active">Mensajeros</button>
          <button type="button" className="bt-menu-item">Administradores</button>
          <button type="button" className="bt-menu-item">Control de acceso</button>
        </nav>
      </aside>

      <div className="bt-main-wrapper">
        <header className="bt-top-header">
          <div className="bt-page-title">
            <div className="bt-edit-badge">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <h2>Editar mensajero</h2>
          </div>
        </header>

        <main className="bt-content">
          <div className="bt-card">
            <form onSubmit={handleSubmit} className="bt-form">
              <div className="bt-field">
                <label htmlFor="nombre">NOMBRE COMPLETO</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Juan Pérez"
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="bt-field">
                <label htmlFor="horario">HORARIO</label>
                <input
                  type="text"
                  id="horario"
                  name="horario"
                  value={formData.horario}
                  onChange={handleChange}
                  placeholder="Ej. 8:00 am – 5:00 pm"
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="bt-field">
                <label htmlFor="capacidadCarga">CAPACIDAD MÁXIMA DE CARGA (KG)</label>
                <input
                  type="number"
                  id="capacidadCarga"
                  name="capacidadCarga"
                  value={formData.capacidadCarga}
                  onChange={handleChange}
                  placeholder="Ej. 20"
                  min="0"
                  step="0.1"
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="bt-actions">
                <button type="submit" className="bt-btn-save" disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  className="bt-btn-deactivate"
                  onClick={onDeactivate}
                  disabled={isSaving}
                >
                  Desactivar mensajero
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      <nav className="bt-mobile-bottom-nav">
        <button type="button" className="bt-bottom-item">
          <span className="bt-bottom-circle"></span>
          <span>Inicio</span>
        </button>
        <button type="button" className="bt-bottom-item active">
          <span className="bt-bottom-circle active"></span>
          <span>Mensajeros</span>
        </button>
        <button type="button" className="bt-bottom-item">
          <span className="bt-bottom-circle"></span>
          <span>Admins</span>
        </button>
        <button type="button" className="bt-bottom-item">
          <span className="bt-bottom-circle"></span>
          <span>Accesos</span>
        </button>
      </nav>
    </div>
  );
};