import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { fetchWithRefresh as FetchWithRefreshType } from '@/lib/fetchWithRefresh';
import type { useSessionTokens as UseSessionTokensType } from '@/stores/sessionTokens';
import type { FinalizeGemPurchaseResult } from '../useFinalizeGemPurchase';

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
const { useFinalizeGemPurchase } = require('../useFinalizeGemPurchase') as {
  useFinalizeGemPurchase: () => ReturnType<
    typeof import('../useFinalizeGemPurchase').useFinalizeGemPurchase
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

const mockResult: FinalizeGemPurchaseResult = {
  id: 'purchase-1',
  gems: 100,
  balanceAfter: 100,
};

beforeEach(() => {
  jest.clearAllMocks();
  useSessionTokens.mockReturnValue(defaultTokensCtx);
});

describe('useFinalizeGemPurchase', () => {
  it('calls the correct endpoint on mutation', async () => {
    fetchWithRefresh.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResult),
    } as Response);

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => useFinalizeGemPurchase(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('order-123');
    });

    expect(fetchWithRefresh).toHaveBeenCalledWith(
      'http://localhost:4000/payments/gems/orders/order-123/finalize',
      expect.objectContaining({ method: 'POST' }),
      expect.objectContaining({ accessToken: 'test-token' }),
    );
  });

  it('returns result on success', async () => {
    fetchWithRefresh.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResult),
    } as Response);

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => useFinalizeGemPurchase(), { wrapper });

    let returned: FinalizeGemPurchaseResult | undefined;
    await act(async () => {
      returned = await result.current.mutateAsync('order-123');
    });

    expect(returned).toEqual(mockResult);
  });

  it('invalidates wallet and gems/pending queries on success', async () => {
    fetchWithRefresh.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResult),
    } as Response);

    const { wrapper, queryClient } = buildWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useFinalizeGemPurchase(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('order-123');
    });

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['wallet'] }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['gems', 'pending'] }),
    );
  });

  it('throws on failure', async () => {
    fetchWithRefresh.mockResolvedValueOnce({
      ok: false,
      status: 400,
    } as Response);

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => useFinalizeGemPurchase(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync('order-bad'),
      ).rejects.toBeInstanceOf(Error);
    });
  });
});
