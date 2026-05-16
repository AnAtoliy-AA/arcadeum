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
  grantWalletAction,
  deductWalletAction,
  loadAdminWalletAction,
} from './wallet.actions';
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

const sampleTransaction = {
  id: 'tx1',
  currency: 'coins',
  delta: 100,
  balanceAfter: 200,
  reason: 'admin_grant',
  createdAt: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  fetchMock.mockReset();
  vi.mocked(revalidatePath).mockReset();
});

// ─── grantWalletAction ────────────────────────────────────────────────────────

describe('grantWalletAction', () => {
  it('happy path — returns ok:true with transaction data', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleTransaction));

    const result = await grantWalletAction({
      userId: 'u1',
      currency: 'coins',
      amount: 100,
    });

    expect(result).toEqual({ ok: true, data: sampleTransaction });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(revalidatePath).toHaveBeenCalledWith('/admin/users');
  });

  it('maps 422 response to error:insufficient', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(422));

    const result = await grantWalletAction({
      userId: 'u1',
      currency: 'coins',
      amount: 100,
    });

    expect(result).toEqual({ ok: false, error: 'insufficient' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('maps 500 to error:generic', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(500));

    const result = await grantWalletAction({
      userId: 'u1',
      currency: 'coins',
      amount: 100,
    });

    expect(result).toEqual({ ok: false, error: 'generic' });
  });

  it('returns error:validation for negative amount without calling fetch', async () => {
    const result = await grantWalletAction({
      userId: 'u1',
      currency: 'coins',
      amount: -50,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('validation');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns error:validation for zero amount', async () => {
    const result = await grantWalletAction({
      userId: 'u1',
      currency: 'coins',
      amount: 0,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('validation');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns error:validation for invalid currency', async () => {
    const result = await grantWalletAction({
      userId: 'u1',
      currency: 'dollars',
      amount: 100,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('validation');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns error:validation for empty userId', async () => {
    const result = await grantWalletAction({
      userId: '',
      currency: 'gems',
      amount: 10,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('validation');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('includes Authorization header with token', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleTransaction));

    await grantWalletAction({ userId: 'u1', currency: 'gems', amount: 5 });

    const [_url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((opts.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer test-token',
    );
  });
});

// ─── deductWalletAction ───────────────────────────────────────────────────────

describe('deductWalletAction', () => {
  it('happy path — returns ok:true', async () => {
    fetchMock.mockResolvedValueOnce(
      makeOkResponse({
        ...sampleTransaction,
        delta: -50,
        reason: 'admin_deduct',
      }),
    );

    const result = await deductWalletAction({
      userId: 'u1',
      currency: 'coins',
      amount: 50,
    });

    expect(result.ok).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith('/admin/users');
  });

  it('maps 422 to error:insufficient', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(422));

    const result = await deductWalletAction({
      userId: 'u1',
      currency: 'coins',
      amount: 9999,
    });

    expect(result).toEqual({ ok: false, error: 'insufficient' });
  });

  it('calls the /deduct endpoint (not /grant)', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(sampleTransaction));

    await deductWalletAction({ userId: 'u2', currency: 'gems', amount: 10 });

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/deduct');
    expect(url).not.toContain('/grant');
  });

  it('returns error:validation for negative amount without calling fetch', async () => {
    const result = await deductWalletAction({
      userId: 'u1',
      currency: 'coins',
      amount: -1,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('validation');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// ─── loadAdminWalletAction ────────────────────────────────────────────────────

describe('loadAdminWalletAction', () => {
  const mockBalance = { coins: 150, gems: 20 };
  const mockRecent = { items: [sampleTransaction], nextCursor: null };

  it('returns merged balance + recent shape on success', async () => {
    fetchMock
      .mockResolvedValueOnce(makeOkResponse(mockBalance))
      .mockResolvedValueOnce(makeOkResponse(mockRecent));

    const result = await loadAdminWalletAction('u1');

    expect(result).toEqual({
      ok: true,
      data: { balance: mockBalance, recent: mockRecent },
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns error:generic when balance fetch fails', async () => {
    fetchMock
      .mockResolvedValueOnce(makeErrorResponse(500))
      .mockResolvedValueOnce(makeOkResponse(mockRecent));

    const result = await loadAdminWalletAction('u1');

    expect(result).toEqual({ ok: false, error: 'generic' });
  });

  it('returns error:generic when transactions fetch fails', async () => {
    fetchMock
      .mockResolvedValueOnce(makeOkResponse(mockBalance))
      .mockResolvedValueOnce(makeErrorResponse(403));

    const result = await loadAdminWalletAction('u1');

    expect(result).toEqual({ ok: false, error: 'generic' });
  });

  it('returns validation error for empty userId', async () => {
    const result = await loadAdminWalletAction('');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('validation');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
