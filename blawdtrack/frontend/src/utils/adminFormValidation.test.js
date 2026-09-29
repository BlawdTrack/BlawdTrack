import { describe, it, expect } from 'vitest';
import { validateAdminForm, MESSAGES } from './adminFormValidation';

describe('validateAdminForm', () => {
  it('shows required errors for empty fields', () => {
    const errors = validateAdminForm({
      documentType: '',
      documentNumber: '   ',
      fullName: '  ',
      phone: '',
      email: '   ',
      initialPassword: '   ',
    });

    expect(errors.documentType).toBe(MESSAGES.required);
    expect(errors.documentNumber).toBe(MESSAGES.required);
    expect(errors.fullName).toBe(MESSAGES.required);
    expect(errors.phone).toBe(MESSAGES.required);
    expect(errors.email).toBe(MESSAGES.required);
    expect(errors.initialPassword).toBe(MESSAGES.required);
  });

  it('validates email and password rules', () => {
    expect(validateAdminForm({
      documentType: 'CEDULA',
      documentNumber: '1-2345-6789',
      fullName: 'Ana',
      phone: '8888-8888',
      email: 'ana@domain',
      initialPassword: 'abc123',
    }).email).toBe(MESSAGES.emailFormat);

    expect(validateAdminForm({
      documentType: 'CEDULA',
      documentNumber: '1-2345-6789',
      fullName: 'Ana',
      phone: '8888-8888',
      email: 'ana@blawdgourmet.com',
      initialPassword: 'abc',
    }).initialPassword).toBe(MESSAGES.passwordStrength);
  });

  it('validates maximum lengths', () => {
    const longName = 'a'.repeat(121);
    const longPhone = '1'.repeat(21);
    const longEmail = `${'a'.repeat(110)}@example.com`;
    const longPassword = `a1${'a'.repeat(118)}1`;

    const errors = validateAdminForm({
      documentType: 'CEDULA',
      documentNumber: '1-2345-6789',
      fullName: longName,
      phone: longPhone,
      email: longEmail,
      initialPassword: longPassword,
    });

    expect(errors.fullName).toBe(MESSAGES.maxLength.fullName);
    expect(errors.phone).toBe(MESSAGES.maxLength.phone);
    expect(errors.email).toBe(MESSAGES.maxLength.email);
    expect(errors.initialPassword).toBe(MESSAGES.maxLength.initialPassword);
  });

  it('accepts valid values', () => {
    expect(validateAdminForm({
      documentType: 'CEDULA',
      documentNumber: '1-2345-6789',
      fullName: 'Rodrigo Castillo Pérez',
      phone: '8888-8888',
      email: 'rodrigo@blawdgourmet.com',
      initialPassword: 'contra123',
    })).toEqual({});
  });
});
