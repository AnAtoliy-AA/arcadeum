import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: () => ({ value: 'test-token' }) }),
}));
vi.mock('@/shared/lib/api-base', () => ({
  resolveApiUrl: (path: string) => `http://localhost:4000${path}`,
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import {
  getActivePackages,
  getPendingPurchases,
  getConversionRate,
} from './gems.server';

function makeOkResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

function makeErrorResponse(status: number, body = ''): Response {
  return {
    ok: false,
    status,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(body),
  } as unknown as Response;
}

const samplePackage = {
  id: 'pkg-1',
  name: 'Starter Pack',
  gems: 100,
  bonusGems: 0,
  priceUsdCents: 999,
  displayOrder: 0,
};

const samplePurchase = {
  id: 'pur-1',
  packageId: 'pkg-1',
  paypalOrderId: 'PP-123',
  amountUsdCents: 999,
  gems: 100,
  status: 'pending',
  createdAt: '2026-05-10T00:00:00.000Z',
  finalizedAt: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getActivePackages', () => {
  it('fetches and returns packages from public endpoint', async () => {
    fetchMock.mockResolvedValue(makeOkResponse([samplePackage]));

    const result = await getActivePackages();
    expect(result).toEqual([samplePackage]);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/payments/gems/packages',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('throws on HTTP error', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse(500, 'server error'));
    await expect(getActivePackages()).rejects.toThrow('Gems fetch failed: 500');
  });
});

describe('getPendingPurchases', () => {
  it('fetches pending purchases with auth header', async () => {
    fetchMock.mockResolvedValue(makeOkResponse([samplePurchase]));

    const result = await getPendingPurchases();
    expect(result).toEqual([samplePurchase]);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/payments/gems/orders/pending',
      expect.objectContaining({
        cache: 'no-store',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
  });

  it('throws on HTTP error', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse(401, 'unauthorized'));
    await expect(getPendingPurchases()).rejects.toThrow(
      'Gems auth fetch failed: 401',
    );
  });
});

describe('getConversionRate', () => {
  it('fetches conversion rate from public endpoint', async () => {
    fetchMock.mockResolvedValue(makeOkResponse({ rate: 100 }));

    const result = await getConversionRate();
    expect(result).toEqual({ rate: 100 });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/wallet/conversion-rate',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('throws on HTTP error', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse(500, 'server error'));
    await expect(getConversionRate()).rejects.toThrow('Gems fetch failed: 500');
  });
});
