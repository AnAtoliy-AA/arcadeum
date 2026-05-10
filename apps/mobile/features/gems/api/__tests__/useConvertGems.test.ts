import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { fetchWithRefresh as FetchWithRefreshType } from '@/lib/fetchWithRefresh';
import type { useSessionTokens as UseSessionTokensType } from '@/stores/sessionTokens';
import type { ConvertGemsResult } from '../useConvertGems';

jest.mock('@/lib/apiBase', () => ({
  resolveApiUrl: (path: string) => `http://localhost:4000${path}`,
}));
jest.mock('@/lib/fetchWithRefresh', () => ({
  fetchWithRefresh: jest.fn(),
}));
jest.mock('@/stores/sessionTokens', () => ({
  useSessionTokens: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fetchWithRefresh } = require('@/lib/fetchWithRefresh') as {
  fetchWithRefresh: jest.MockedFunction<typeof FetchWithRefreshType>;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useSessionTokens } = require('@/stores/sessionTokens') as {
  useSessionTokens: jest.MockedFunction<typeof UseSessionTokensType>;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useConvertGems } = require('../useConvertGems') as {
  useConvertGems: () => ReturnType<
    typeof import('../useConvertGems').useConvertGems
  >;
};

const defaultTokensCtx = {
  tokens: {
    provider: null,
    accessToken: 'test-token',
    refreshToken: null,
    tokenType: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
    updatedAt: null,
    userId: 'user-1',
    email: null,
    username: null,
    displayName: null,
  },
  hydrated: true,
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
  reload: jest.fn(),
  refreshTokens: jest.fn(),
} as ReturnType<typeof UseSessionTokensType>;

function buildWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return { wrapper, queryClient };
}

const mockResult: ConvertGemsResult = {
  gemsDebited: 50,
  coinscredited: 5,
  balanceAfter: { coins: 105, gems: 50 },
};

beforeEach(() => {
  jest.clearAllMocks();
  useSessionTokens.mockReturnValue(defaultTokensCtx);
});

describe('useConvertGems', () => {
  it('calls the correct endpoint with payload', async () => {
    fetchWithRefresh.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResult),
    } as Response);

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => useConvertGems(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        gems: 50,
        conversionId: 'conv-uuid-1',
      });
    });

    expect(fetchWithRefresh).toHaveBeenCalledWith(
      'http://localhost:4000/wallet/convert-gems-to-coins',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ gems: 50, conversionId: 'conv-uuid-1' }),
      }),
      expect.objectContaining({ accessToken: 'test-token' }),
    );
  });

  it('returns conversion result on success', async () => {
    fetchWithRefresh.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResult),
    } as Response);

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => useConvertGems(), { wrapper });

    let returned: ConvertGemsResult | undefined;
    await act(async () => {
      returned = await result.current.mutateAsync({
        gems: 50,
        conversionId: 'conv-uuid-1',
      });
    });

    expect(returned).toEqual(mockResult);
  });

  it('invalidates wallet queries on success', async () => {
    fetchWithRefresh.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResult),
    } as Response);

    const { wrapper, queryClient } = buildWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useConvertGems(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        gems: 50,
        conversionId: 'conv-uuid-1',
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['wallet'] }),
    );
  });

  it('throws on failure', async () => {
    fetchWithRefresh.mockResolvedValueOnce({
      ok: false,
      status: 422,
    } as Response);

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => useConvertGems(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ gems: 9999, conversionId: 'conv-bad' }),
      ).rejects.toBeInstanceOf(Error);
    });
  });
});
