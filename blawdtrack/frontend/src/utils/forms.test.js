import { describe, it, expect } from 'vitest';
import { isFormDirty } from './forms';

describe('isFormDirty', () => {
  const initial = { name: 'Ana', age: 30, phone: '' };

  it('is clean while every field equals its starting value', () => {
    expect(isFormDirty({ ...initial }, initial)).toBe(false);
    expect(isFormDirty({ name: 'Ana', age: '30', phone: undefined }, initial)).toBe(false);
  });

  it('is dirty as soon as one field differs', () => {
    expect(isFormDirty({ ...initial, phone: '8888' }, initial)).toBe(true);
    expect(isFormDirty({ ...initial, name: '' }, initial)).toBe(true);
  });

  it('never reports changes without starting values', () => {
    expect(isFormDirty({ name: 'x' }, null)).toBe(false);
  });
});
