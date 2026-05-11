import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock next/* before importing actions ─────────────────────────────────────
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: () => ({ value: 'test-token' }) }),
}));
vi.mock('@/shared/lib/api-base', () => ({
  resolveApiUrl: (path: string) => `http://localhost:4000${path}`,
}));

// Mock global fetch
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import {
  setEconomyValueAction,
  resetEconomyValueAction,
  refreshCacheAction,
  loadEconomyHistoryAction,
} from './economy.actions';
import { revalidatePath } from 'next/cache';

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

const sampleSetting = {
  key: 'game_win_coin_reward',
  currentValue: 77,
  defaultValue: 50,
  source: 'override',
  updatedAt: '2026-05-10T00:00:00Z',
  updatedByLabel: 'Alice',
};

const sampleAuditRows = [
  {
    id: 'audit-1',
    fromValue: 50,
    toValue: 77,
    adminLabel: 'Alice',
    changedAt: '2026-05-10T00:00:00Z',
  },
];

beforeEach(() => {
  fetchMock.mockReset();
  vi.mocked(revalidatePath).mockReset();
});

// ─── setEconomyValueAction ────────────────────────────────────────────────────

describe('setEconomyValueAction', () => {
  it('happy path — returns ok:true with updated setting', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleSetting));

    const result = await setEconomyValueAction({
      key: 'game_win_coin_reward',
      value: 77,
    });

    expect(result).toEqual({ ok: true, data: sampleSetting });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(revalidatePath).toHaveBeenCalledWith('/admin/economy');
  });

  it('uses PUT method', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleSetting));

    await setEconomyValueAction({ key: 'game_win_coin_reward', value: 77 });

    const [_url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(opts.method).toBe('PUT');
  });

  it('includes Authorization header with token', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleSetting));

    await setEconomyValueAction({ key: 'game_win_coin_reward', value: 77 });

    const [_url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((opts.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer test-token',
    );
  });

  it('returns validation error for non-integer value (0) without calling fetch', async () => {
    const result = await setEconomyValueAction({
      key: 'game_win_coin_reward',
      value: 0,
    });

    expect(result).toEqual({ ok: false, error: 'validation' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns validation error for negative value without calling fetch', async () => {
    const result = await setEconomyValueAction({
      key: 'game_win_coin_reward',
      value: -1,
    });

    expect(result).toEqual({ ok: false, error: 'validation' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps 400 response to error:validation', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(400));

    const result = await setEconomyValueAction({
      key: 'game_win_coin_reward',
      value: 77,
    });

    expect(result).toEqual({ ok: false, error: 'validation' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('maps 404 response to error:not_found', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(404));

    const result = await setEconomyValueAction({
      key: 'game_win_coin_reward',
      value: 77,
    });

    expect(result).toEqual({ ok: false, error: 'not_found' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('maps 403 response to error:forbidden', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(403));

    const result = await setEconomyValueAction({
      key: 'game_win_coin_reward',
      value: 77,
    });

    expect(result).toEqual({ ok: false, error: 'forbidden' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('maps 500 response to error:generic', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(500));

    const result = await setEconomyValueAction({
      key: 'game_win_coin_reward',
      value: 77,
    });

    expect(result).toEqual({ ok: false, error: 'generic' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('does not call revalidatePath on error', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(400));

    await setEconomyValueAction({ key: 'game_win_coin_reward', value: 77 });

    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

// ─── resetEconomyValueAction ──────────────────────────────────────────────────

describe('resetEconomyValueAction', () => {
  it('happy path — returns ok:true with reset:true', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(null, 204));

    const result = await resetEconomyValueAction({
      key: 'game_win_coin_reward',
    });

    expect(result).toEqual({ ok: true, data: { reset: true } });
    expect(revalidatePath).toHaveBeenCalledWith('/admin/economy');
  });

  it('uses DELETE method', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(null, 204));

    await resetEconomyValueAction({ key: 'game_win_coin_reward' });

    const [_url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(opts.method).toBe('DELETE');
  });

  it('maps 404 to error:not_found', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(404));

    const result = await resetEconomyValueAction({
      key: 'game_win_coin_reward',
    });

    expect(result).toEqual({ ok: false, error: 'not_found' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('maps 403 to error:forbidden', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(403));

    const result = await resetEconomyValueAction({
      key: 'gem_to_coin_rate',
    });

    expect(result).toEqual({ ok: false, error: 'forbidden' });
  });

  it('maps 500 to error:generic', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(500));

    const result = await resetEconomyValueAction({
      key: 'game_win_coin_reward',
    });

    expect(result).toEqual({ ok: false, error: 'generic' });
  });
});

// ─── refreshCacheAction ───────────────────────────────────────────────────────

describe('refreshCacheAction', () => {
  it('happy path — returns ok:true with refreshed:true', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(null, 204));

    const result = await refreshCacheAction();

    expect(result).toEqual({ ok: true, data: { refreshed: true } });
    expect(revalidatePath).toHaveBeenCalledWith('/admin/economy');
  });

  it('uses POST method', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(null, 204));

    await refreshCacheAction();

    const [_url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(opts.method).toBe('POST');
  });

  it('hits the refresh-cache endpoint', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(null, 204));

    await refreshCacheAction();

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/admin/economy/refresh-cache');
  });

  it('maps 403 to error:forbidden', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(403));

    const result = await refreshCacheAction();

    expect(result).toEqual({ ok: false, error: 'forbidden' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('maps 500 to error:generic', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(500));

    const result = await refreshCacheAction();

    expect(result).toEqual({ ok: false, error: 'generic' });
  });
});

// ─── loadEconomyHistoryAction ─────────────────────────────────────────────────

describe('loadEconomyHistoryAction', () => {
  it('happy path — returns ok:true with audit rows', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleAuditRows));

    const result = await loadEconomyHistoryAction({
      key: 'game_win_coin_reward',
    });

    expect(result).toEqual({ ok: true, data: sampleAuditRows });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('hits the audit endpoint for the given key', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleAuditRows));

    await loadEconomyHistoryAction({ key: 'gem_to_coin_rate' });

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/admin/economy/gem_to_coin_rate/audit');
  });

  it('maps 404 to error:not_found', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(404));

    const result = await loadEconomyHistoryAction({
      key: 'game_win_coin_reward',
    });

    expect(result).toEqual({ ok: false, error: 'not_found' });
  });

  it('maps 403 to error:forbidden', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(403));

    const result = await loadEconomyHistoryAction({
      key: 'game_win_coin_reward',
    });

    expect(result).toEqual({ ok: false, error: 'forbidden' });
  });

  it('maps 500 to error:generic', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(500));

    const result = await loadEconomyHistoryAction({
      key: 'game_win_coin_reward',
    });

    expect(result).toEqual({ ok: false, error: 'generic' });
  });
});
