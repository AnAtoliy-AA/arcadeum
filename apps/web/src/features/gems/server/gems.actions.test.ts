import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: () => ({ value: 'test-token' }) }),
}));
vi.mock('@/shared/lib/api-base', () => ({
  resolveApiUrl: (path: string) => `http://localhost:4000${path}`,
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import {
  buyGemsAction,
  finalizeGemPurchaseAction,
  convertGemsAction,
} from './gems.actions';
import { revalidatePath } from 'next/cache';

function makeOkResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

function makeErrorResponse(status: number, body: unknown = {}): Response {
  return {
    ok: false,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── buyGemsAction ────────────────────────────────────────────────────────────

describe('buyGemsAction', () => {
  it('returns approveUrl and paypalOrderId on success', async () => {
    fetchMock.mockResolvedValue(
      makeOkResponse({
        paypalOrderId: 'PP-123',
        approveUrl: 'https://paypal.com/approve/PP-123',
      }),
    );

    const result = await buyGemsAction({ packageId: 'pkg-1' });

    expect(result).toEqual({
      ok: true,
      approveUrl: 'https://paypal.com/approve/PP-123',
      paypalOrderId: 'PP-123',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/payments/gems/orders',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ packageId: 'pkg-1' }),
      }),
    );
  });

  it('returns not_found error on 404', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse(404));
    const result = await buyGemsAction({ packageId: 'missing' });
    expect(result).toEqual({ ok: false, error: 'not_found' });
  });

  it('returns inactive error when BE returns inactive message', async () => {
    fetchMock.mockResolvedValue(
      makeErrorResponse(400, { message: 'gems.packageInactive' }),
    );
    const result = await buyGemsAction({ packageId: 'pkg-1' });
    expect(result).toEqual({ ok: false, error: 'inactive' });
  });

  it('returns unavailable error on 503', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse(503));
    const result = await buyGemsAction({ packageId: 'pkg-1' });
    expect(result).toEqual({ ok: false, error: 'unavailable' });
  });

  it('returns generic error on 500', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse(500));
    const result = await buyGemsAction({ packageId: 'pkg-1' });
    expect(result).toEqual({ ok: false, error: 'generic' });
  });

  it('returns unauthorized error on 401', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse(401));
    const result = await buyGemsAction({ packageId: 'pkg-1' });
    expect(result).toEqual({ ok: false, error: 'unauthorized' });
  });

  it('returns unauthorized error on 403', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse(403));
    const result = await buyGemsAction({ packageId: 'pkg-1' });
    expect(result).toEqual({ ok: false, error: 'unauthorized' });
  });
});

// ─── finalizeGemPurchaseAction ────────────────────────────────────────────────

describe('finalizeGemPurchaseAction', () => {
  it('returns success with gemsCredited and newBalance', async () => {
    fetchMock.mockResolvedValue(
      makeOkResponse({
        success: true,
        gemsCredited: 100,
        newBalance: { coins: 500, gems: 100 },
      }),
    );

    const result = await finalizeGemPurchaseAction({ orderId: 'PP-123' });

    expect(result).toEqual({
      ok: true,
      gemsCredited: 100,
      newBalance: { coins: 500, gems: 100 },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/wallet');
  });

  it('returns not_captured error on orderNotCaptured message', async () => {
    fetchMock.mockResolvedValue(
      makeErrorResponse(400, { message: 'gems.orderNotCaptured' }),
    );
    const result = await finalizeGemPurchaseAction({ orderId: 'PP-123' });
    expect(result).toEqual({ ok: false, error: 'not_captured' });
  });

  it('returns not_found on 404', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse(404));
    const result = await finalizeGemPurchaseAction({ orderId: 'PP-999' });
    expect(result).toEqual({ ok: false, error: 'not_found' });
  });

  it('returns not_eligible on orderNotEligible message', async () => {
    fetchMock.mockResolvedValue(
      makeErrorResponse(400, { message: 'gems.orderNotEligible' }),
    );
    const result = await finalizeGemPurchaseAction({ orderId: 'PP-123' });
    expect(result).toEqual({ ok: false, error: 'not_eligible' });
  });

  it('returns generic error on 500', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse(500));
    const result = await finalizeGemPurchaseAction({ orderId: 'PP-123' });
    expect(result).toEqual({ ok: false, error: 'generic' });
  });
});

// ─── convertGemsAction ────────────────────────────────────────────────────────

describe('convertGemsAction', () => {
  const conversionResult = {
    gemsDebited: 5,
    coinsCredited: 500,
    newBalance: { coins: 1000, gems: 95 },
    rate: 100,
  };

  it('returns conversion result on success', async () => {
    fetchMock.mockResolvedValue(makeOkResponse(conversionResult));

    const result = await convertGemsAction({
      gems: 5,
      conversionId: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(result).toEqual({ ok: true, data: conversionResult });
    expect(revalidatePath).toHaveBeenCalledWith('/wallet');
  });

  it('returns insufficient error on 422 with insufficientFunds message', async () => {
    fetchMock.mockResolvedValue(
      makeErrorResponse(422, { message: 'wallet.insufficientFunds' }),
    );

    const result = await convertGemsAction({
      gems: 9999,
      conversionId: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(result).toEqual({ ok: false, error: 'insufficient' });
  });

  it('returns invalid error for bad gems value (<=0)', async () => {
    const result = await convertGemsAction({
      gems: 0,
      conversionId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result).toEqual({ ok: false, error: 'invalid' });
  });

  it('returns invalid error on invalidConversionId BE message', async () => {
    fetchMock.mockResolvedValue(
      makeErrorResponse(400, { message: 'gems.invalidConversionId' }),
    );

    const result = await convertGemsAction({
      gems: 5,
      conversionId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result).toEqual({ ok: false, error: 'invalid' });
  });

  it('returns generic error on 500', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse(500));

    const result = await convertGemsAction({
      gems: 5,
      conversionId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result).toEqual({ ok: false, error: 'generic' });
  });

  it('posts correct body to BE', async () => {
    fetchMock.mockResolvedValue(makeOkResponse(conversionResult));

    await convertGemsAction({
      gems: 10,
      conversionId: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/wallet/convert-gems-to-coins',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          gems: 10,
          conversionId: '550e8400-e29b-41d4-a716-446655440000',
        }),
      }),
    );
  });
});
