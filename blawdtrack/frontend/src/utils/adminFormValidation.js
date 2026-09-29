// UX-only validation for the admin registration form: required fields, email
// format and the initial-password shape. Business rules (document format,
// uniqueness) live in the backend and are not duplicated here.

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
// Mirrors AdminRegistrationRequest.contrasenaInicial: >= 8 chars, at least one letter and one digit.
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const MESSAGES = {
  documentType: 'Selecciona un tipo de documento.',
  documentNumber: 'Ingresa el número de documento.',
  nombreCompleto: 'Ingresa el nombre completo.',
  numeroTelefono: 'Ingresa el número de teléfono.',
  correoElectronicoRequired: 'Ingresa el correo electrónico.',
  correoElectronicoFormat: 'Ingresa un correo electrónico válido.',
  contrasenaInicialRequired: 'Ingresa una contraseña inicial.',
  contrasenaInicialFormat: 'La contraseña debe tener al menos 8 caracteres, combinando letras y números.',
};

export function validateAdminForm(formData) {
  const errors = {};

  if (!formData.documentType) errors.documentType = MESSAGES.documentType;
  if (!formData.documentNumber.trim()) errors.documentNumber = MESSAGES.documentNumber;
  if (!formData.nombreCompleto.trim()) errors.nombreCompleto = MESSAGES.nombreCompleto;
  if (!formData.numeroTelefono.trim()) errors.numeroTelefono = MESSAGES.numeroTelefono;

  const email = formData.correoElectronico.trim();
  if (!email) {
    errors.correoElectronico = MESSAGES.correoElectronicoRequired;
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.correoElectronico = MESSAGES.correoElectronicoFormat;
  }

  const password = formData.contrasenaInicial;
  if (!password) {
    errors.contrasenaInicial = MESSAGES.contrasenaInicialRequired;
  } else if (!PASSWORD_PATTERN.test(password)) {
    errors.contrasenaInicial = MESSAGES.contrasenaInicialFormat;
  }

  return errors;
}

export default validateAdminForm;
