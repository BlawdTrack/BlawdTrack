const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{4}-?[0-9]{4}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export function validateAdminRegistration(formData) {
  const errors = {};

  if (!formData.fullName.trim()) {
    errors.fullName = 'El nombre completo es obligatorio.';
  }

  if (!formData.idCard.trim()) {
    errors.idCard = 'La cédula es obligatoria.';
  }

  if (!formData.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (!emailRegex.test(formData.email.trim())) {
    errors.email = 'Ingresa un correo electrónico válido.';
  }

  if (!formData.phoneNumber.trim()) {
    errors.phoneNumber = 'El teléfono es obligatorio.';
  } else if (!phoneRegex.test(formData.phoneNumber.trim())) {
    errors.phoneNumber = 'Ingresa un teléfono válido.';
  }

  if (!formData.password.trim()) {
    errors.password = 'La contraseña inicial es obligatoria.';
  } else if (!passwordRegex.test(formData.password.trim())) {
    errors.password =
      'Debe tener al menos 8 caracteres e incluir letras y números.';
  }

  return errors;
}