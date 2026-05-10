import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { fetchWithRefresh as FetchWithRefreshType } from '@/lib/fetchWithRefresh';
import type { useSessionTokens as UseSessionTokensType } from '@/stores/sessionTokens';

jest.mock('@/lib/apiBase', () => ({
  resolveApiUrl: (path: string) => `http://localhost:4000${path}`,
}));
jest.mock('@/lib/fetchWithRefresh', () => ({
  fetchWithRefresh: jest.fn(),
}));
jest.mock('@/stores/sessionTokens', () => ({
  useSessionTokens: jest.fn(),
}));
jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(),
}));
jest.mock('../useFinalizeGemPurchase', () => ({
  useFinalizeGemPurchase: jest.fn(),
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
const WebBrowser = require('expo-web-browser') as {
  openAuthSessionAsync: jest.MockedFunction<
    (url: string, redirect: string) => Promise<{ type: string; url?: string }>
  >;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useFinalizeGemPurchase } = require('../useFinalizeGemPurchase') as {
  useFinalizeGemPurchase: jest.MockedFunction<
    typeof import('../useFinalizeGemPurchase').useFinalizeGemPurchase
  >;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useBuyGems } = require('../useBuyGems') as {
  useBuyGems: () => ReturnType<typeof import('../useBuyGems').useBuyGems>;
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

beforeEach(() => {
  jest.clearAllMocks();
  useSessionTokens.mockReturnValue(defaultTokensCtx);
  (
    useFinalizeGemPurchase as jest.MockedFunction<typeof useFinalizeGemPurchase>
  ).mockReturnValue({
    mutateAsync: jest.fn().mockResolvedValue({
      id: 'p-1',
      gems: 100,
      balanceAfter: 100,
    } as unknown as never),
    mutate: jest.fn(),
    reset: jest.fn(),
    status: 'idle',
    isIdle: true,
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    data: undefined,
    variables: undefined,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    submittedAt: 0,
    context: undefined,
  } as unknown as ReturnType<typeof useFinalizeGemPurchase>);
});

describe('useBuyGems', () => {
  it('creates order and calls WebBrowser on mutation', async () => {
    fetchWithRefresh.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          approveUrl: 'https://paypal.test/approve',
          paypalOrderId: 'PP-TEST-1',
          orderId: 'order-1',
        }),
    } as Response);

    WebBrowser.openAuthSessionAsync.mockResolvedValueOnce({
      type: 'cancel',
    });

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => useBuyGems(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('pkg-1');
    });

    expect(fetchWithRefresh).toHaveBeenCalledWith(
      'http://localhost:4000/payments/gems/orders',
      expect.objectContaining({ method: 'POST' }),
      expect.anything(),
    );
    expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith(
      'https://paypal.test/approve',
      expect.any(String),
    );
  });

  it('returns pending when PayPal is cancelled', async () => {
    fetchWithRefresh.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          approveUrl: 'https://paypal.test/approve',
          paypalOrderId: 'PP-TEST-1',
          orderId: 'order-cancel',
        }),
    } as Response);

    WebBrowser.openAuthSessionAsync.mockResolvedValueOnce({ type: 'cancel' });

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => useBuyGems(), { wrapper });

    let res: Awaited<ReturnType<typeof result.current.mutateAsync>> | undefined;
    await act(async () => {
      res = await result.current.mutateAsync('pkg-1');
    });

    expect(res?.status).toBe('pending');
  });

  it('returns success and calls finalize when PayPal succeeds', async () => {
    fetchWithRefresh.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          approveUrl: 'https://paypal.test/approve',
          paypalOrderId: 'PP-TEST-1',
          orderId: 'order-success',
        }),
    } as Response);

    WebBrowser.openAuthSessionAsync.mockResolvedValueOnce({
      type: 'success',
      url: 'arcadeum://payment-return?orderId=order-success',
    });

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => useBuyGems(), { wrapper });

    let res: Awaited<ReturnType<typeof result.current.mutateAsync>> | undefined;
    await act(async () => {
      res = await result.current.mutateAsync('pkg-1');
    });

    expect(res?.status).toBe('success');
  });

  it('throws when create order fails', async () => {
    fetchWithRefresh.mockResolvedValueOnce({
      ok: false,
      status: 400,
    } as Response);

    const { wrapper } = buildWrapper();
    const { result } = renderHook(() => useBuyGems(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync('pkg-bad'),
      ).rejects.toBeInstanceOf(Error);
    });
  });
});
