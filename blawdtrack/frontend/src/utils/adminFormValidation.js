// UX-only validation for the admin registration form: required fields and email
// format. Business rules (document format, uniqueness) live in the backend and are
// not duplicated here. There is no password field: the backend generates one.

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

const MESSAGES = {
  documentType: 'Selecciona un tipo de documento.',
  documentNumber: 'Ingresa el número de documento.',
  nombreCompleto: 'Ingresa el nombre completo.',
  numeroTelefono: 'Ingresa el número de teléfono.',
  correoElectronicoRequired: 'Ingresa el correo electrónico.',
  correoElectronicoFormat: 'Ingresa un correo electrónico válido.',
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

  return errors;
}

export default validateAdminForm;
