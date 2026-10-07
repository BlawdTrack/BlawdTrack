import { describe, it, expect } from 'vitest';
import {
  EMPTY_COURIER_FORM,
  courierToFormValues,
  diffCourierForm,
  getScheduleTimeRange,
  getStatusLock,
  isCourierActive,
  isFormDirty,
  recordsLabel,
  validateCourierEditForm,
} from './courierEdit';

const courier = {
  id: 7,
  documentNumber: '1-0345-0678',
  fullName: 'María José Solano',
  email: 'maria@example.com',
  phone: '88888888',
  schedule: '6:00 am – 2:00 pm',
  maxPackageWeightKg: 25,
  status: 'ACTIVE',
};

describe('courierToFormValues', () => {
  it('builds the form from a courier of the API', () => {
    expect(courierToFormValues(courier)).toMatchObject({
      fullName: 'María José Solano',
      email: 'maria@example.com',
      phone: '88888888',
      schedule: '6:00 am – 2:00 pm',
      scheduleStart: '06:00',
      scheduleEnd: '14:00',
      maxLoadCapacityKg: '25',
      password: '',
      status: 'ACTIVE',
    });
  });

  it('understands the legacy Spanish field names', () => {
    expect(courierToFormValues({ nombre: 'Ana', horario: '8:00 am – 4:00 pm', capacidad: 10, estado: 'Inactivo' })).toMatchObject({
      fullName: 'Ana',
      schedule: '8:00 am – 4:00 pm',
      maxLoadCapacityKg: '10',
      status: 'INACTIVE',
    });
  });
});

describe('isCourierActive and getScheduleTimeRange', () => {
  it('reads the status of the API and falls back to the legacy field', () => {
    expect(isCourierActive({ status: 'ACTIVE' })).toBe(true);
    expect(isCourierActive({ status: 'INACTIVE' })).toBe(false);
    expect(isCourierActive({ estado: 'Inactivo' })).toBe(false);
    expect(isCourierActive({})).toBe(true);
  });

  it('keeps only the hours of a schedule', () => {
    expect(getScheduleTimeRange('8:00 am – 1:00 pm, lunes a viernes')).toBe('8:00 am – 1:00 pm');
    expect(getScheduleTimeRange(undefined)).toBe('');
  });
});

describe('isFormDirty and diffCourierForm', () => {
  const initial = courierToFormValues(courier);

  it('is clean until some field differs from what was loaded', () => {
    expect(isFormDirty(initial, initial)).toBe(false);
    expect(isFormDirty({ ...initial, phone: '1' }, initial)).toBe(true);
    expect(isFormDirty(initial, null)).toBe(false);
  });

  it('groups the changes by the call they need', () => {
    expect(diffCourierForm(initial, initial)).toEqual({
      dataChanged: false, statusChanged: false, passwordChanged: false, hasChanges: false,
    });
    expect(diffCourierForm({ ...initial, fullName: 'Otro' }, initial)).toMatchObject({ dataChanged: true, hasChanges: true });
    expect(diffCourierForm({ ...initial, maxLoadCapacityKg: '30' }, initial).dataChanged).toBe(true);
    expect(diffCourierForm({ ...initial, status: 'INACTIVE' }, initial)).toMatchObject({ statusChanged: true, dataChanged: false });
    expect(diffCourierForm({ ...initial, password: 'Nueva2026x' }, initial)).toMatchObject({ passwordChanged: true, dataChanged: false });
  });
});

describe('validateCourierEditForm', () => {
  const valid = courierToFormValues(courier);

  it('accepts a valid form', () => {
    expect(validateCourierEditForm(valid)).toEqual({});
  });

  it('reports each invalid field', () => {
    const errors = validateCourierEditForm({
      ...EMPTY_COURIER_FORM,
      email: 'sin-arroba',
      maxLoadCapacityKg: '0',
      password: 'corta',
    });
    expect(Object.keys(errors).sort()).toEqual(['email', 'fullName', 'maxLoadCapacityKg', 'password', 'schedule']);
  });

  it('rejects an exit hour that is not after the entry hour', () => {
    expect(validateCourierEditForm({ ...valid, scheduleStart: '14:00', scheduleEnd: '08:00' }).schedule)
      .toBe('La hora de salida debe ser posterior a la de entrada.');
  });
});

describe('getStatusLock and recordsLabel', () => {
  it('locks the access status while the courier is working or has packages in process', () => {
    expect(getStatusLock({ inLabor: true }).locked).toBe(true);
    expect(getStatusLock({ pendingPackages: 2 })).toMatchObject({ locked: true, pendingPackages: 2 });
    expect(getStatusLock({}).locked).toBe(false);
    expect(getStatusLock(null).locked).toBe(false);
  });

  it('pluralises the records label', () => {
    expect(recordsLabel(1)).toBe('1 registro');
    expect(recordsLabel(0)).toBe('0 registros');
    expect(recordsLabel(11)).toBe('11 registros');
  });
});
