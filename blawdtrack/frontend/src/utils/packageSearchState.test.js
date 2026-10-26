import { describe, expect, it } from 'vitest';
import { hasNoSearchMatches } from './packageSearchState';

describe('hasNoSearchMatches', () => {
  it('returns true when a search or a status filter has no matches', () => {
    expect(hasNoSearchMatches({
      isFiltering: true,
      results: { content: [] },
      isLoading: false,
      errorMessage: null,
    })).toBe(true);
  });

  it('returns false when nothing is applied, loading states, errors or results with rows', () => {
    expect(hasNoSearchMatches({
      isFiltering: false,
      results: { content: [] },
      isLoading: false,
      errorMessage: null,
    })).toBe(false);

    expect(hasNoSearchMatches({
      isFiltering: false,
      results: { content: [] },
      isLoading: false,
      errorMessage: null,
    })).toBe(false);

    expect(hasNoSearchMatches({
      isFiltering: true,
      results: null,
      isLoading: false,
      errorMessage: null,
    })).toBe(false);

    expect(hasNoSearchMatches({
      isFiltering: true,
      results: { content: [] },
      isLoading: true,
      errorMessage: null,
    })).toBe(false);

    expect(hasNoSearchMatches({
      isFiltering: true,
      results: { content: [] },
      isLoading: false,
      errorMessage: 'Error',
    })).toBe(false);

    expect(hasNoSearchMatches({
      isFiltering: true,
      results: { content: [{ id: 1 }] },
      isLoading: false,
      errorMessage: null,
    })).toBe(false);
  });
});
