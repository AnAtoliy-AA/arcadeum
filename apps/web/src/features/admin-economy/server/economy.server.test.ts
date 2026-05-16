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

import { listEconomySettings, getEconomyAudit } from './economy.server';

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

const sampleSettings = [
  {
    key: 'game_win_coin_reward',
    currentValue: 50,
    defaultValue: 50,
    source: 'default',
    updatedAt: null,
    updatedByLabel: null,
  },
  {
    key: 'gem_to_coin_rate',
    currentValue: 100,
    defaultValue: 100,
    source: 'env',
    updatedAt: null,
    updatedByLabel: null,
  },
];

const sampleAudit = [
  {
    id: 'audit-1',
    fromValue: 50,
    toValue: 100,
    adminLabel: 'Alice',
    changedAt: '2026-05-10T00:00:00Z',
  },
];

beforeEach(() => {
  fetchMock.mockReset();
});

// ─── listEconomySettings ──────────────────────────────────────────────────────

describe('listEconomySettings', () => {
  it('returns the list of economy settings on success', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleSettings));

    const result = await listEconomySettings();

    expect(result).toEqual(sampleSettings);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/admin/economy');
  });

  it('includes Authorization header with token', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleSettings));

    await listEconomySettings();

    const [_url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((opts.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer test-token',
    );
  });

  it('uses cache: no-store', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleSettings));

    await listEconomySettings();

    const [_url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(opts.cache).toBe('no-store');
  });

  it('throws when the response is not ok', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(403));

    await expect(listEconomySettings()).rejects.toThrow(
      'listEconomySettings failed: 403',
    );
  });

  it('throws on 500 error', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(500));

    await expect(listEconomySettings()).rejects.toThrow(
      'listEconomySettings failed: 500',
    );
  });
});

// ─── getEconomyAudit ──────────────────────────────────────────────────────────

describe('getEconomyAudit', () => {
  it('returns audit rows for a valid key', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleAudit));

    const result = await getEconomyAudit('game_win_coin_reward');

    expect(result).toEqual(sampleAudit);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/admin/economy/game_win_coin_reward/audit');
  });

  it('includes Authorization header with token', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleAudit));

    await getEconomyAudit('gem_to_coin_rate');

    const [_url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((opts.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer test-token',
    );
  });

  it('URL-encodes the key', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleAudit));

    await getEconomyAudit('referral_tier_1_bonus_coins');

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('referral_tier_1_bonus_coins');
  });

  it('throws when the response is not ok', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(404));

    await expect(getEconomyAudit('game_win_coin_reward')).rejects.toThrow(
      'getEconomyAudit failed: 404',
    );
  });
});
