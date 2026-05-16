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

import { claimDailyRewardAction } from './daily-rewards.actions';
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

const sampleClaimResult = {
  awardedCoins: 10,
  currentStreak: 1,
  balanceAfter: 110,
};

beforeEach(() => {
  fetchMock.mockReset();
  vi.mocked(revalidatePath).mockReset();
});

describe('claimDailyRewardAction', () => {
  it('happy path — returns ok:true with claim result and revalidates wallet + home', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleClaimResult, 201));

    const result = await claimDailyRewardAction();

    expect(result).toEqual({ ok: true, result: sampleClaimResult });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(revalidatePath).toHaveBeenCalledWith('/wallet');
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });

  it('uses POST method against /daily-rewards/claim', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleClaimResult));

    await claimDailyRewardAction();

    const [url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/daily-rewards/claim');
    expect(opts.method).toBe('POST');
  });

  it('includes Authorization header with token', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleClaimResult));

    await claimDailyRewardAction();

    const [, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((opts.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer test-token',
    );
  });

  it('maps 409 response to error:already_claimed', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(409));

    const result = await claimDailyRewardAction();

    expect(result).toEqual({ ok: false, code: 'already_claimed' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('maps 401 response to error:unauthorized', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(401));

    const result = await claimDailyRewardAction();

    expect(result).toEqual({ ok: false, code: 'unauthorized' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('maps 500 response to error:unknown', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(500));

    const result = await claimDailyRewardAction();

    expect(result).toEqual({ ok: false, code: 'unknown' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('maps network/fetch errors to error:unknown', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'));

    const result = await claimDailyRewardAction();

    expect(result).toEqual({ ok: false, code: 'unknown' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
