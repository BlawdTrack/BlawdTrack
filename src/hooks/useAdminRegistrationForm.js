import { useState } from 'react';
import { validateAdminRegistration } from './adminRegistrationValidation.js';

const initialFormData = {
  fullName: '',
  idCard: '',
  email: '',
  phoneNumber: '',
  password: ''
};

export function useAdminRegistrationForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: ''
    }));

    setMessage('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validateAdminRegistration(formData);

    setErrors(nextErrors);
    setMessage('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    // TODO: conectar con el servicio de registro de administradores.
    // No imprimir datos personales ni contraseñas en la consola.
    setMessage(
      'Formulario validado. El registro estará disponible al conectar el servicio.'
    );
  };

  return {
    formData,
    errors,
    message,
    handleChange,
    handleSubmit
  };
}