import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock server-only before importing the module
vi.mock('server-only', () => ({}));

// Mock next/headers
const mockGet = vi.fn();
vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: mockGet,
    }),
  ),
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock api-base
vi.mock('@/shared/lib/api-base', () => ({
  resolveApiUrl: (path: string) => `http://localhost:4000${path}`,
}));

import { getWalletBalance, getWalletTransactions } from './wallet.server';

function makeOkResponse(body: unknown): Response {
  return {
    ok: true,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

function makeErrorResponse(status: number, text: string): Response {
  return {
    ok: false,
    status,
    text: () => Promise.resolve(text),
  } as unknown as Response;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGet.mockReturnValue(undefined);
});

describe('getWalletBalance', () => {
  it('returns parsed JSON from /wallet/balance', async () => {
    const balance = { coins: 42, gems: 3 };
    mockFetch.mockResolvedValueOnce(makeOkResponse(balance));

    const result = await getWalletBalance();

    expect(result).toEqual(balance);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/wallet/balance',
      expect.objectContaining({
        cache: 'no-store',
      }),
    );
  });

  it('sends Authorization header when access token cookie is present', async () => {
    const balance = { coins: 10, gems: 0 };
    mockGet.mockReturnValueOnce({ value: 'test-jwt-token' });
    mockFetch.mockResolvedValueOnce(makeOkResponse(balance));

    await getWalletBalance();

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer test-jwt-token',
    );
  });

  it('does not send Authorization header when no cookie', async () => {
    const balance = { coins: 0, gems: 0 };
    mockGet.mockReturnValueOnce(undefined);
    mockFetch.mockResolvedValueOnce(makeOkResponse(balance));

    await getWalletBalance();

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(
      (init.headers as Record<string, string>)['Authorization'],
    ).toBeUndefined();
  });

  it('throws on non-OK response', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(401, 'Unauthorized'));

    await expect(getWalletBalance()).rejects.toThrow(
      'Wallet fetch failed: 401',
    );
  });
});

describe('getWalletTransactions', () => {
  it('calls /wallet/transactions without query string when no opts provided', async () => {
    const response = { items: [], nextCursor: null };
    mockFetch.mockResolvedValueOnce(makeOkResponse(response));

    const result = await getWalletTransactions({});

    expect(result).toEqual(response);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/wallet/transactions',
      expect.any(Object),
    );
  });

  it('composes querystring with currency', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({ items: [], nextCursor: null }),
    );

    await getWalletTransactions({ currency: 'coins' });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toBe(
      'http://localhost:4000/wallet/transactions?currency=coins',
    );
  });

  it('composes querystring with cursor and limit', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({ items: [], nextCursor: null }),
    );

    await getWalletTransactions({ cursor: 'abc123', limit: 10 });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toBe(
      'http://localhost:4000/wallet/transactions?cursor=abc123&limit=10',
    );
  });

  it('composes querystring with all three opts', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({ items: [], nextCursor: null }),
    );

    await getWalletTransactions({ currency: 'gems', cursor: 'xyz', limit: 20 });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toBe(
      'http://localhost:4000/wallet/transactions?currency=gems&cursor=xyz&limit=20',
    );
  });

  it('throws on non-OK response', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(403, 'Forbidden'));

    await expect(getWalletTransactions({})).rejects.toThrow(
      'Wallet fetch failed: 403',
    );
  });
});
