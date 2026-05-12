import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { ConversionRate } from '../useConversionRate';

jest.mock('@/lib/apiBase', () => ({
  resolveApiUrl: (path: string) => `http://localhost:4000${path}`,
}));

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useConversionRate } = require('../useConversionRate') as {
  useConversionRate: () => ReturnType<
    typeof import('../useConversionRate').useConversionRate
  >;
};

function buildWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return { wrapper, queryClient };
}

const mockRate: ConversionRate = {
  gemsPerCoin: 10,
  coinsPerGem: 0.1,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useConversionRate', () => {
  it('uses the correct query key', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRate),
    } as Response);

    const { wrapper, queryClient } = buildWrapper();
    renderHook(() => useConversionRate(), { wrapper });

    await waitFor(() =>
      expect(queryClient.getQueryState(['gems', 'rate'])).toBeDefined(),
    );
  });

  it('returns conversion rate on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRate),
    } as Response);

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => useConversionRate(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockRate);
  });

  it('calls the correct endpoint without auth', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRate),
    } as Response);

    const { wrapper } = buildWrapper();
    renderHook(() => useConversionRate(), { wrapper });

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/wallet/conversion-rate',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('returns error state when request fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
    } as Response);

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => useConversionRate(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
