import { describe, it, expect } from 'vitest';
import { normalizeSearchTerm } from './packageSearchTerm';

describe('normalizeSearchTerm', () => {
  it('trims and limits the term to 100 characters', () => {
    const raw = `   ${'a'.repeat(150)}   `;
    expect(normalizeSearchTerm(raw)).toBe('a'.repeat(100));
  });

  it('returns an empty string for null, undefined and blank input', () => {
    expect(normalizeSearchTerm(null)).toBe('');
    expect(normalizeSearchTerm(undefined)).toBe('');
    expect(normalizeSearchTerm('   ')).toBe('');
  });
});
