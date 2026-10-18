import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '../api/axiosClient';
import { searchPackages } from './PackageService';

vi.mock('../api/axiosClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('PackageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the search endpoint with params, omits empty term and forwards the signal', async () => {
    const signal = new AbortController().signal;
    const payload = { content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 };
    axiosClient.get.mockResolvedValue({ data: payload });

    await expect(searchPackages({ term: '  ', page: 0, size: 100, signal })).resolves.toEqual(payload);
    expect(axiosClient.get).toHaveBeenCalledWith('/v1/packages/search', {
      params: { page: 0, size: 100 },
      signal,
    });

    await searchPackages({ term: 'cafe', page: 1, size: 20, signal });
    expect(axiosClient.get).toHaveBeenLastCalledWith('/v1/packages/search', {
      params: { term: 'cafe', page: 1, size: 20 },
      signal,
    });
  });
});
