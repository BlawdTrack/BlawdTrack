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

  it('sends the field only when the search is limited to one and there is a term', async () => {
    axiosClient.get.mockResolvedValue({ data: {} });

    await searchPackages({ term: 'ana', field: 'customerName' });
    expect(axiosClient.get).toHaveBeenLastCalledWith('/v1/packages/search', {
      params: { term: 'ana', field: 'customerName', page: 0, size: 100 },
      signal: undefined,
    });

    await searchPackages({ term: 'ana', field: 'all' });
    await searchPackages({ term: '', field: 'phone' });
    expect(axiosClient.get.mock.calls.slice(-2).map(([, config]) => config.params)).toEqual([
      { term: 'ana', page: 0, size: 100 },
      { page: 0, size: 100 },
    ]);
  });
});
