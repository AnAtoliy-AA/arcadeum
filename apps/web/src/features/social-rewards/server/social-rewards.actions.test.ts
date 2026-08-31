import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: () => ({ value: 'test-token' }) }),
}));

const TEST_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
vi.mock('@/shared/lib/api-base', () => ({
  resolveApiUrl: (path: string) => `${TEST_API_BASE}${path}`,
}));
vi.mock('@/shared/lib/server-auth-fetch', () => ({
  serverAuthFetch: vi
    .fn()
    .mockImplementation(async (path: string, init?: RequestInit) => {
      return fetchMock(`${TEST_API_BASE}${path}`, init);
    }),
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import { claimSocialRewardAction } from './social-rewards.actions';
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
  success: true,
  platform: 'discord',
  gemsAwarded: 1,
  gemsBalanceAfter: 6,
  claimedAt: '2026-08-31T12:00:00.000Z',
};

beforeEach(() => {
  fetchMock.mockReset();
  vi.mocked(revalidatePath).mockReset();
});

describe('claimSocialRewardAction', () => {
  it('happy path returns ok:true with claim result and revalidates paths', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleClaimResult, 200));

    const result = await claimSocialRewardAction('discord');

    expect(result).toEqual({ ok: true, result: sampleClaimResult });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(revalidatePath).toHaveBeenCalledWith('/wallet');
    expect(revalidatePath).toHaveBeenCalledWith('/rewards');
    expect(revalidatePath).toHaveBeenCalledWith('/community');
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });

  it('uses POST method and passes platform payload', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleClaimResult));

    await claimSocialRewardAction('telegram');

    const [url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/social-rewards/claim');
    expect(opts.method).toBe('POST');
    expect(opts.body).toBe(JSON.stringify({ platform: 'telegram' }));
  });

  it('maps 409 response to error:already_claimed', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(409));

    const result = await claimSocialRewardAction('discord');

    expect(result).toEqual({ ok: false, code: 'already_claimed' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('maps 401 response to error:unauthorized', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(401));

    const result = await claimSocialRewardAction('discord');

    expect(result).toEqual({ ok: false, code: 'unauthorized' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('maps 400 response to error:invalid_platform', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(400));

    const result = await claimSocialRewardAction('unknown');

    expect(result).toEqual({ ok: false, code: 'invalid_platform' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('maps network errors to error:unknown', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network error'));

    const result = await claimSocialRewardAction('discord');

    expect(result).toEqual({ ok: false, code: 'unknown' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
