import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { fetchWithRefresh as FetchWithRefreshType } from '@/lib/fetchWithRefresh';
import type { useSessionTokens as UseSessionTokensType } from '@/stores/sessionTokens';
import type { WalletBalance, PaginatedWalletTransactions } from '../useWallet';

// Mock dependencies
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
const { useWalletBalance, useWalletTransactions } = require('../useWallet') as {
  useWalletBalance: () => ReturnType<
    typeof import('../useWallet').useWalletBalance
  >;
  useWalletTransactions: (
    currency?: import('../useWallet').WalletCurrency,
  ) => ReturnType<typeof import('../useWallet').useWalletTransactions>;
};

function buildWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return { wrapper, queryClient };
}

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

beforeEach(() => {
  useSessionTokens.mockReturnValue(defaultTokensCtx);
});

describe('useWalletBalance', () => {
  it('returns balance data on success', async () => {
    const balance: WalletBalance = { coins: 42, gems: 7 };
    fetchWithRefresh.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(balance),
    } as Response);

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => useWalletBalance(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(balance);
  });

  it('returns error state when request fails', async () => {
    fetchWithRefresh.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    } as Response);

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => useWalletBalance(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('is disabled when no access token', () => {
    useSessionTokens.mockReturnValue({
      ...defaultTokensCtx,
      tokens: { ...defaultTokensCtx.tokens, accessToken: null },
    });

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => useWalletBalance(), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.status).toBe('pending');
  });
});

describe('useWalletTransactions', () => {
  it('returns paginated transactions on success', async () => {
    const page: PaginatedWalletTransactions = {
      items: [
        {
          id: 'tx-1',
          currency: 'coins',
          delta: 10,
          balanceAfter: 52,
          reason: 'admin_grant',
          createdAt: '2026-01-01T00:00:00Z',
        },
      ],
      nextCursor: null,
    };
    fetchWithRefresh.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(page),
    } as Response);

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => useWalletTransactions(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0]).toEqual(page);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('passes currency filter in query params', async () => {
    const page: PaginatedWalletTransactions = { items: [], nextCursor: null };
    fetchWithRefresh.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(page),
    } as Response);

    const { wrapper } = buildWrapper();
    renderHook(() => useWalletTransactions('coins'), { wrapper });

    await waitFor(() =>
      expect(fetchWithRefresh).toHaveBeenCalledWith(
        expect.stringContaining('currency=coins'),
        expect.anything(),
        expect.anything(),
      ),
    );
  });
});
