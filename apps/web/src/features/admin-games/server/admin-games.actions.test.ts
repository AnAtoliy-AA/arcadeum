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

import { setGameTierAction, setVariantTierAction } from './admin-games.actions';
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

beforeEach(() => {
  fetchMock.mockReset();
  vi.mocked(revalidatePath).mockReset();
});

// ─── setGameTierAction ────────────────────────────────────────────────────────

describe('setGameTierAction', () => {
  it('happy path — returns ok:true and revalidates /admin/games', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(null, 204));

    const result = await setGameTierAction({
      gameId: 'chess_v1',
      tier: 'premium_plus',
    });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(revalidatePath).toHaveBeenCalledWith('/admin/games');
  });

  it('uses PUT method against the game visibility endpoint', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(null, 204));

    await setGameTierAction({ gameId: 'chess_v1', tier: 'all' });

    const [url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:4000/admin/games/chess_v1/visibility');
    expect(opts.method).toBe('PUT');
    expect(opts.body).toBe(JSON.stringify({ tier: 'all' }));
  });

  it('includes Authorization header with token', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(null, 204));

    await setGameTierAction({ gameId: 'chess_v1', tier: 'all' });

    const [_url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((opts.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer test-token',
    );
  });

  it('encodes the gameId in the URL path', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(null, 204));

    await setGameTierAction({ gameId: 'game/with spaces', tier: 'all' });

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(encodeURIComponent('game/with spaces'));
  });

  it('maps 400 response to error:validation and does not revalidate', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(400));

    const result = await setGameTierAction({
      gameId: 'chess_v1',
      tier: 'all',
    });

    expect(result).toEqual({ ok: false, error: 'validation' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('maps 403 response to error:forbidden and does not revalidate', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(403));

    const result = await setGameTierAction({
      gameId: 'chess_v1',
      tier: 'all',
    });

    expect(result).toEqual({ ok: false, error: 'forbidden' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('maps 500 response to error:generic and does not revalidate', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(500));

    const result = await setGameTierAction({
      gameId: 'chess_v1',
      tier: 'all',
    });

    expect(result).toEqual({ ok: false, error: 'generic' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

// ─── setVariantTierAction ─────────────────────────────────────────────────────

describe('setVariantTierAction', () => {
  it('happy path — returns ok:true and revalidates /admin/games', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(null, 204));

    const result = await setVariantTierAction({
      gameId: 'chess_v1',
      variantId: 'blitz',
      tier: 'vip_plus',
    });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(revalidatePath).toHaveBeenCalledWith('/admin/games');
  });

  it('uses PUT method against the variant visibility endpoint', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(null, 204));

    await setVariantTierAction({
      gameId: 'chess_v1',
      variantId: 'blitz',
      tier: 'all',
    });

    const [url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      'http://localhost:4000/admin/games/chess_v1/variants/blitz/visibility',
    );
    expect(opts.method).toBe('PUT');
    expect(opts.body).toBe(JSON.stringify({ tier: 'all' }));
  });

  it('includes Authorization header with token', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(null, 204));

    await setVariantTierAction({
      gameId: 'chess_v1',
      variantId: 'blitz',
      tier: 'all',
    });

    const [_url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((opts.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer test-token',
    );
  });

  it('encodes both gameId and variantId in the URL path', async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(null, 204));

    await setVariantTierAction({
      gameId: 'game/id',
      variantId: 'variant id',
      tier: 'all',
    });

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(encodeURIComponent('game/id'));
    expect(url).toContain(encodeURIComponent('variant id'));
  });

  it('maps 400 response to error:validation and does not revalidate', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(400));

    const result = await setVariantTierAction({
      gameId: 'chess_v1',
      variantId: 'blitz',
      tier: 'all',
    });

    expect(result).toEqual({ ok: false, error: 'validation' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('maps 403 response to error:forbidden and does not revalidate', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(403));

    const result = await setVariantTierAction({
      gameId: 'chess_v1',
      variantId: 'blitz',
      tier: 'all',
    });

    expect(result).toEqual({ ok: false, error: 'forbidden' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('maps 500 response to error:generic and does not revalidate', async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(500));

    const result = await setVariantTierAction({
      gameId: 'chess_v1',
      variantId: 'blitz',
      tier: 'all',
    });

    expect(result).toEqual({ ok: false, error: 'generic' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
