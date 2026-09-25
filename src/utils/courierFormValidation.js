// UX-only validation for the courier registration form: required fields,
// email format and a positive numeric weight. Business rules (document
// format, uniqueness) live in the backend and are not duplicated here.

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

const MESSAGES = {
  documentType: 'Selecciona un tipo de documento.',
  documentNumber: 'Ingresa el número de documento.',
  fullName: 'Ingresa el nombre completo.',
  emailRequired: 'Ingresa el correo electrónico.',
  emailFormat: 'Ingresa un correo electrónico válido.',
  schedule: 'Ingresa el horario.',
  scheduleOrder: 'La hora de salida debe ser posterior a la de entrada.',
  weight: 'Ingresa un número positivo (hasta 8 enteros y 2 decimales).',
};

export function validateCourierForm(formData) {
  const errors = {};

  if (!formData.documentType) errors.documentType = MESSAGES.documentType;
  if (!formData.documentNumber.trim()) errors.documentNumber = MESSAGES.documentNumber;
  if (!formData.fullName.trim()) errors.fullName = MESSAGES.fullName;

  const email = formData.email.trim();
  if (!email) {
    errors.email = MESSAGES.emailRequired;
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = MESSAGES.emailFormat;
  }

  if (!formData.schedule.trim()) {
    errors.schedule = MESSAGES.schedule;
  } else if (formData.scheduleStart && formData.scheduleEnd && formData.scheduleEnd <= formData.scheduleStart) {
    // "HH:MM" 24h strings compare correctly as text.
    errors.schedule = MESSAGES.scheduleOrder;
  }

  const weightText = formData.maxPackageWeightKg.trim();
  const weight = Number(weightText);
  if (weightText === '' || !Number.isFinite(weight) || weight <= 0) {
    errors.maxPackageWeightKg = MESSAGES.weight;
  }

  return errors;
}
