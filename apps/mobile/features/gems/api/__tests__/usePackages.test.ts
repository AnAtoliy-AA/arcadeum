import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { GemPackage } from '../usePackages';

jest.mock('@/lib/apiBase', () => ({
  resolveApiUrl: (path: string) => `http://localhost:4000${path}`,
}));

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { usePackages } = require('../usePackages') as {
  usePackages: () => ReturnType<typeof import('../usePackages').usePackages>;
};

function buildWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return { wrapper, queryClient };
}

const mockPackages: GemPackage[] = [
  {
    id: 'pkg-1',
    name: 'Starter Pack',
    gems: 100,
    bonusGems: 0,
    priceUsd: 0.99,
    currency: 'USD',
    isActive: true,
  },
  {
    id: 'pkg-2',
    name: 'Value Pack',
    gems: 500,
    bonusGems: 50,
    priceUsd: 4.99,
    currency: 'USD',
    isActive: true,
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('usePackages', () => {
  it('uses the correct query key', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPackages),
    } as Response);

    const { wrapper, queryClient } = buildWrapper();
    renderHook(() => usePackages(), { wrapper });

    await waitFor(() =>
      expect(queryClient.getQueryState(['gems', 'packages'])).toBeDefined(),
    );
  });

  it('returns packages on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPackages),
    } as Response);

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => usePackages(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPackages);
  });

  it('calls the correct endpoint without auth', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const { wrapper } = buildWrapper();
    renderHook(() => usePackages(), { wrapper });

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/payments/gems/packages',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('returns error state when request fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => usePackages(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
