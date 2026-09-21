const REQUIRED_FIELDS = {
  fullName: 'El nombre completo es obligatorio',
  idCard: 'La cédula es obligatoria',
  email: 'El correo electrónico es obligatorio',
  phoneNumber: 'El teléfono es obligatorio',
  password: 'La contraseña inicial es obligatoria'
};

export function validateAdminRegistration(formData) {
  const errors = {};

  Object.entries(REQUIRED_FIELDS).forEach(([field, message]) => {
    if (!formData[field].trim()) {
      errors[field] = message;
    }
  });

  return errors;
}