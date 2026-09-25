import { describe, it, expect } from 'vitest';
import { getInitials } from './getInitials';

describe('getInitials', () => {
  it('returns the first letters of the first two words', () => {
    expect(getInitials('María José Solano')).toBe('MJ');
  });

  it('handles a single word', () => {
    expect(getInitials('Alicia')).toBe('A');
  });

  it('ignores extra whitespace', () => {
    expect(getInitials('  Ana   Lucía  ')).toBe('AL');
  });

  it('returns an empty string for empty or missing names', () => {
    expect(getInitials('')).toBe('');
    expect(getInitials('   ')).toBe('');
    expect(getInitials()).toBe('');
  });
});
