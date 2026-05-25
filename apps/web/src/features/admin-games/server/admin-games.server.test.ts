import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock server-only and next/* before importing the module ──────────────────
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: () => ({ value: 'test-token' }) }),
}));
vi.mock('@/shared/lib/api-base', () => ({
  resolveApiUrl: (path: string) => `http://localhost:4000${path}`,
}));

// Mock global fetch
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import { listAdminGames } from './admin-games.server';
import type { AdminGameRow } from '../types';

function makeOkResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

function makeErrorResponse(status: number): Response {
  return {
    ok: false,
    status,
    json: () => Promise.resolve({ message: 'error' }),
    text: () => Promise.resolve('error'),
  } as unknown as Response;
}

const sampleRows: AdminGameRow[] = [
  {
    gameId: 'critical_v1',
    tier: 'all',
    variants: [],
  },
  {
    gameId: 'chess_v1',
    tier: 'premium_plus',
    variants: [
      { variantId: 'blitz', tier: 'all' },
      { variantId: 'bullet', tier: 'vip_plus' },
    ],
  },
];

beforeEach(() => {
  fetchMock.mockReset();
});

// ─── listAdminGames ───────────────────────────────────────────────────────────

describe('listAdminGames', () => {
  it('GETs /admin/games/visibility and returns the rows', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleRows));

    const result = await listAdminGames();

    expect(result).toEqual(sampleRows);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:4000/admin/games/visibility');
    expect(opts.cache).toBe('no-store');
  });

  it('includes Authorization header with token', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleRows));

    await listAdminGames();

    const [_url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((opts.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer test-token',
    );
  });

  it('uses cache: no-store', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleRows));

    await listAdminGames();

    const [_url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(opts.cache).toBe('no-store');
  });

  it('throws on non-ok response', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(500));

    await expect(listAdminGames()).rejects.toThrow(
      'listAdminGames failed: 500',
    );
  });

  it('throws on 403 forbidden', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(403));

    await expect(listAdminGames()).rejects.toThrow(
      'listAdminGames failed: 403',
    );
  });
});
