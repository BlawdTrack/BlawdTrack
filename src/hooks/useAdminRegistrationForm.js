import { useState } from 'react';
import { validateAdminRegistration } from '../validation/adminRegistrationValidation.js';

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
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validateAdminRegistration(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    // TODO: conectar con el servicio real de registro de administradores.
    // Aquí solo se valida el formulario sin simular registro.
  };

  return {
    formData,
    errors,
    handleChange,
    handleSubmit
  };
}