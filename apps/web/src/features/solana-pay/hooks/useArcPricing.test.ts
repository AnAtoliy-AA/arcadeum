import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const getArcPricing = vi.fn();
vi.mock('@/shared/api/solana-pay', () => ({
  getArcPricing: () => getArcPricing(),
}));

import { useArcPricing } from './useArcPricing';

const base = {
  arcUsdPrice: 0.00001,
  priceSource: 'geckoterminal',
  priceAgeSeconds: 3,
  gemToUsdRate: 0.1,
  discountPercent: 10,
  gemsAllowArc: true,
  shopAllowArc: true,
};

beforeEach(() => getArcPricing.mockReset());

describe('useArcPricing', () => {
  it('quotes with the discount, rounded up, when the price is ok', async () => {
    getArcPricing.mockResolvedValue({ ...base, priceStatus: 'ok' });
    const { result } = renderHook(() => useArcPricing());
    await waitFor(() => expect(result.current.priceAvailable).toBe(true));
    // $5 - 10% = $4.50 at $0.00001/ARC
    expect(result.current.calculateArcPrice(5)).toBe(450_000);
  });

  it.each(['stale', 'unavailable', 'unconfigured'] as const)(
    'never quotes when the price status is %s',
    async (priceStatus) => {
      getArcPricing.mockResolvedValue({ ...base, priceStatus });
      const { result } = renderHook(() => useArcPricing());
      await waitFor(() => expect(result.current.pricing).not.toBeNull());
      expect(result.current.priceAvailable).toBe(false);
      expect(result.current.calculateArcPrice(5)).toBe(0);
    },
  );
});
