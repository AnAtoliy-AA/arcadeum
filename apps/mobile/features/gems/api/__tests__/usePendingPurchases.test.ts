import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { fetchWithRefresh as FetchWithRefreshType } from '@/lib/fetchWithRefresh';
import type { useSessionTokens as UseSessionTokensType } from '@/stores/sessionTokens';
import type { PendingGemPurchase } from '../usePendingPurchases';

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
const { usePendingPurchases } = require('../usePendingPurchases') as {
  usePendingPurchases: () => ReturnType<
    typeof import('../usePendingPurchases').usePendingPurchases
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
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return { wrapper, queryClient };
}

const mockPending: PendingGemPurchase[] = [
  {
    id: 'purchase-1',
    packageId: 'pkg-1',
    packageName: 'Starter Pack',
    gems: 100,
    paypalOrderId: 'PP-TEST-1',
    approveUrl: 'https://paypal.test/approve',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  useSessionTokens.mockReturnValue(defaultTokensCtx);
});

describe('usePendingPurchases', () => {
  it('uses the correct query key', async () => {
    fetchWithRefresh.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPending),
    } as Response);

    const { wrapper, queryClient } = buildWrapper();
    renderHook(() => usePendingPurchases(), { wrapper });

    await waitFor(() =>
      expect(queryClient.getQueryState(['gems', 'pending'])).toBeDefined(),
    );
  });

  it('returns pending purchases on success', async () => {
    fetchWithRefresh.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPending),
    } as Response);

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => usePendingPurchases(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPending);
  });

  it('is disabled when no access token', () => {
    useSessionTokens.mockReturnValue({
      ...defaultTokensCtx,
      tokens: { ...defaultTokensCtx.tokens, accessToken: null },
    });

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => usePendingPurchases(), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.status).toBe('pending');
  });

  it('returns error state when request fails', async () => {
    fetchWithRefresh.mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response);

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => usePendingPurchases(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
