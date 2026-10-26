import { describe, it, expect } from 'vitest';
import { validateCourierForm } from './courierFormValidation';

const validForm = () => ({
  documentType: 'CEDULA',
  documentNumber: '1-1204-0388',
  fullName: 'Ana Lucía Bermúdez',
  phone: '',
  email: 'ana@blawdgourmet.com',
  schedule: '08:00 - 16:00',
  scheduleStart: '08:00',
  scheduleEnd: '16:00',
  maxPackageWeightKg: '20',
});

describe('validateCourierForm', () => {
  it('returns no errors for a valid form', () => {
    expect(validateCourierForm(validForm())).toEqual({});
  });

  it('does not require the phone', () => {
    expect(validateCourierForm({ ...validForm(), phone: '' })).not.toHaveProperty('phone');
  });

  it.each(['documentNumber', 'fullName', 'email', 'schedule', 'maxPackageWeightKg'])(
    'requires %s and treats whitespace-only as empty',
    (field) => {
      expect(validateCourierForm({ ...validForm(), [field]: '' })).toHaveProperty(field);
      expect(validateCourierForm({ ...validForm(), [field]: '   ' })).toHaveProperty(field);
    }
  );

  it('requires a document type', () => {
    expect(validateCourierForm({ ...validForm(), documentType: '' })).toHaveProperty('documentType');
  });

  it.each(['plain', 'a@b', 'a@b.c', '@b.com', 'a b@c.com'])('rejects the invalid email "%s"', (email) => {
    expect(validateCourierForm({ ...validForm(), email }).email).toMatch(/válido/);
  });

  it('accepts an email with surrounding spaces', () => {
    expect(validateCourierForm({ ...validForm(), email: '  ana@blawdgourmet.com ' })).not.toHaveProperty('email');
  });

  it.each(['0', '-5', 'abc', '1e', 'Infinity'])('rejects the weight "%s"', (weight) => {
    expect(validateCourierForm({ ...validForm(), maxPackageWeightKg: weight })).toHaveProperty('maxPackageWeightKg');
  });

  it('accepts decimal weights', () => {
    expect(validateCourierForm({ ...validForm(), maxPackageWeightKg: '12.5' })).toEqual({});
  });

  it('rejects an exit time equal to or before the entry time', () => {
    const equal = validateCourierForm({ ...validForm(), scheduleStart: '08:00', scheduleEnd: '08:00' });
    const before = validateCourierForm({ ...validForm(), scheduleStart: '16:00', scheduleEnd: '08:00' });
    expect(equal.schedule).toMatch(/posterior/);
    expect(before.schedule).toMatch(/posterior/);
  });

  it('reports every failing field at once', () => {
    const errors = validateCourierForm({
      documentType: '',
      documentNumber: '',
      fullName: '',
      phone: '',
      email: '',
      schedule: '',
      scheduleStart: '',
      scheduleEnd: '',
      maxPackageWeightKg: '',
    });
    expect(Object.keys(errors).sort()).toEqual(
      ['documentNumber', 'documentType', 'email', 'fullName', 'maxPackageWeightKg', 'schedule'].sort()
    );
  });
});
