import { describe, it, expect } from 'vitest';
import {
  adminToFormValues,
  diffAdminForm,
  getAdminDocument,
  getAdminName,
  isAdminActive,
  validateAdminEditForm,
} from './adminEdit';

const initial = { fullName: 'Ana Mora', email: 'ana@blawdgourmet.com', password: '', status: 'ACTIVE' };

describe('lectura del administrador', () => {
  it('toma el nombre del perfil (fullName) o de la lista (name)', () => {
    expect(getAdminName({ fullName: 'Ana' })).toBe('Ana');
    expect(getAdminName({ name: 'Beto' })).toBe('Beto');
    expect(getAdminName(null)).toBe('');
  });

  it('toma el documento del perfil o de la lista', () => {
    expect(getAdminDocument({ documentNumber: '2-0345-0987' })).toBe('2-0345-0987');
    expect(getAdminDocument({ identification: '1-1111-2222' })).toBe('1-1111-2222');
    expect(getAdminDocument(undefined)).toBe('');
  });

  it('si no hay estado conocido, la cuenta se asume activa', () => {
    expect(isAdminActive({ status: 'INACTIVE' })).toBe(false);
    expect(isAdminActive({ status: 'ACTIVE' })).toBe(true);
    expect(isAdminActive({})).toBe(true);
  });
});

describe('adminToFormValues', () => {
  it('prellena nombre, correo y estado, y deja la contraseña vacía', () => {
    expect(adminToFormValues({ fullName: 'Ana Mora', email: 'ana@blawdgourmet.com', status: 'INACTIVE', phone: '1' })).toEqual({
      fullName: 'Ana Mora',
      email: 'ana@blawdgourmet.com',
      password: '',
      status: 'INACTIVE',
    });
  });

  it('tolera campos ausentes', () => {
    expect(adminToFormValues({})).toEqual({ fullName: '', email: '', password: '', status: 'ACTIVE' });
  });
});

describe('diffAdminForm', () => {
  it('sin cambios no hay nada que enviar', () => {
    expect(diffAdminForm(initial, initial)).toEqual({ changes: {}, hasChanges: false, closesSession: false });
  });

  it('envía solo los campos que cambiaron', () => {
    const { changes } = diffAdminForm({ ...initial, fullName: 'Ana Nueva' }, initial);

    expect(changes).toEqual({ fullName: 'Ana Nueva' });
  });

  it('limpia los espacios y no cuenta como cambio un correo que solo difiere en mayúsculas', () => {
    expect(diffAdminForm({ ...initial, fullName: '  Ana Mora  ', email: 'ANA@blawdgourmet.com' }, initial).hasChanges).toBe(false);
    expect(diffAdminForm({ ...initial, email: '  nuevo@blawdgourmet.com ' }, initial).changes).toEqual({ email: 'nuevo@blawdgourmet.com' });
  });

  it('la contraseña se envía solo si se escribió, y junto con el estado cierra la sesión', () => {
    expect(diffAdminForm({ ...initial, password: 'NuevaClave123' }, initial)).toEqual({
      changes: { password: 'NuevaClave123' },
      hasChanges: true,
      closesSession: true,
    });
    expect(diffAdminForm({ ...initial, status: 'INACTIVE' }, initial)).toEqual({
      changes: { status: 'INACTIVE' },
      hasChanges: true,
      closesSession: true,
    });
  });

  it('cambiar solo el nombre o el correo no cierra la sesión', () => {
    expect(diffAdminForm({ ...initial, fullName: 'Otra' }, initial).closesSession).toBe(false);
    expect(diffAdminForm({ ...initial, email: 'otro@blawdgourmet.com' }, initial).closesSession).toBe(false);
  });
});

describe('validateAdminEditForm', () => {
  it('un formulario correcto no tiene errores, con o sin contraseña', () => {
    expect(validateAdminEditForm(initial)).toEqual({});
    expect(validateAdminEditForm({ ...initial, password: 'NuevaClave123' })).toEqual({});
  });

  it('exige nombre y correo, y el correo debe tener forma de correo', () => {
    expect(validateAdminEditForm({ ...initial, fullName: '   ' }).fullName).toMatch(/requerido/);
    expect(validateAdminEditForm({ ...initial, email: '' }).email).toMatch(/requerido/);
    expect(validateAdminEditForm({ ...initial, email: 'no-es-correo' }).email).toMatch(/válido/);
  });

  it('el nombre no puede pasar de 120 caracteres', () => {
    expect(validateAdminEditForm({ ...initial, fullName: 'a'.repeat(121) }).fullName).toMatch(/120/);
    expect(validateAdminEditForm({ ...initial, fullName: 'a'.repeat(120) }).fullName).toBeUndefined();
  });

  it.each([['corta1'], ['soloLetrasSinNumero'], ['123456789']])('rechaza la contraseña %s', (password) => {
    expect(validateAdminEditForm({ ...initial, password }).password).toMatch(/8 caracteres y combinar letras y números/);
  });
});
