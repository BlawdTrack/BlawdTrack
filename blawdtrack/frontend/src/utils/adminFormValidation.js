const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const MESSAGES = {
  required: 'Requerido.',
  emailFormat: 'Correo con formato inválido.',
  passwordStrength: 'Mínimo 8 caracteres, combinando letras y números.',
  maxLength: {
    documentNumber: 'Máximo 120 caracteres.',
    fullName: 'Máximo 120 caracteres.',
    phone: 'Máximo 20 caracteres.',
    email: 'Máximo 120 caracteres.',
    initialPassword: 'Máximo 120 caracteres.',
  },
};

function validateMaxLength(fieldName, value) {
  const limit = fieldName === 'phone' ? 20 : 120;
  if (value.length > limit) {
    return MESSAGES.maxLength[fieldName];
  }
  return null;
}

export function validateAdminForm(formData) {
  const errors = {};
  const values = {
    documentType: formData.documentType ?? '',
    documentNumber: (formData.documentNumber ?? '').trim(),
    fullName: (formData.fullName ?? '').trim(),
    phone: (formData.phone ?? '').trim(),
    email: (formData.email ?? '').trim(),
    initialPassword: (formData.initialPassword ?? '').trim(),
  };

  const fields = Object.keys(values);
  fields.forEach((field) => {
    if (!values[field]) {
      errors[field] = MESSAGES.required;
    }
  });

  if (values.phone && validateMaxLength('phone', values.phone)) {
    errors.phone = MESSAGES.maxLength.phone;
  }

  if (values.email) {
    if (!EMAIL_PATTERN.test(values.email)) {
      errors.email = MESSAGES.emailFormat;
    } else if (validateMaxLength('email', values.email)) {
      errors.email = MESSAGES.maxLength.email;
    }
  }

  if (values.initialPassword) {
    if (!PASSWORD_PATTERN.test(values.initialPassword)) {
      errors.initialPassword = MESSAGES.passwordStrength;
    } else if (validateMaxLength('initialPassword', values.initialPassword)) {
      errors.initialPassword = MESSAGES.maxLength.initialPassword;
    }
  }

  if (values.documentNumber && validateMaxLength('documentNumber', values.documentNumber)) {
    errors.documentNumber = MESSAGES.maxLength.documentNumber;
  }

  if (values.fullName && validateMaxLength('fullName', values.fullName)) {
    errors.fullName = MESSAGES.maxLength.fullName;
  }

  return errors;
}
