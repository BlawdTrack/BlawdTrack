import { describe, expect, it } from 'vitest';
import { hasNoSearchMatches } from './packageSearchState';

describe('hasNoSearchMatches', () => {
  it('returns true when a non-empty term has no matches', () => {
    expect(hasNoSearchMatches({
      term: 'Limon',
      results: { content: [] },
      isLoading: false,
      errorMessage: null,
    })).toBe(true);
  });

  it('returns false for empty terms, loading states, errors or results with rows', () => {
    expect(hasNoSearchMatches({
      term: '',
      results: { content: [] },
      isLoading: false,
      errorMessage: null,
    })).toBe(false);

    expect(hasNoSearchMatches({
      term: '   ',
      results: { content: [] },
      isLoading: false,
      errorMessage: null,
    })).toBe(false);

    expect(hasNoSearchMatches({
      term: 'Limon',
      results: null,
      isLoading: false,
      errorMessage: null,
    })).toBe(false);

    expect(hasNoSearchMatches({
      term: 'Limon',
      results: { content: [] },
      isLoading: true,
      errorMessage: null,
    })).toBe(false);

    expect(hasNoSearchMatches({
      term: 'Limon',
      results: { content: [] },
      isLoading: false,
      errorMessage: 'Error',
    })).toBe(false);

    expect(hasNoSearchMatches({
      term: 'Limon',
      results: { content: [{ id: 1 }] },
      isLoading: false,
      errorMessage: null,
    })).toBe(false);
  });
});
