import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: () => ({ value: 'test-token' }) }),
}));

const TEST_API_BASE = 'http://localhost:4000';
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

vi.mock('@/shared/lib/server-auth-fetch', () => ({
  serverAuthFetch: vi
    .fn()
    .mockImplementation(async (path: string, init?: RequestInit) => {
      return fetchMock(`${TEST_API_BASE}${path}`, init);
    }),
}));

import { buyFreezeAction } from './buy-freeze.actions';
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

const sampleResult = {
  freezeTokens: 3,
  coinsSpent: 100,
};

describe('buyFreezeAction', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.mocked(revalidatePath).mockReset();
  });

  it('happy path — returns ok:true with updated freezeTokens and revalidates paths', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleResult, 200));

    const result = await buyFreezeAction(1);

    expect(result).toEqual({ ok: true, result: sampleResult });
    expect(revalidatePath).toHaveBeenCalledWith('/rewards');
    expect(revalidatePath).toHaveBeenCalledWith('/wallet');
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });

  it('handles 401 unauthorized', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(401));

    const result = await buyFreezeAction(1);

    expect(result).toEqual({ ok: false, code: 'unauthorized' });
  });

  it('handles 400 insufficient funds', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(400));

    const result = await buyFreezeAction(1);

    expect(result).toEqual({ ok: false, code: 'insufficient_funds' });
  });

  it('handles network failure gracefully', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    const result = await buyFreezeAction(1);

    expect(result).toEqual({ ok: false, code: 'unknown' });
  });
});
