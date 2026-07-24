'use client';

import { useEffect, useState } from 'react';
import { getArcPricing, type ArcPricing } from '@/shared/api/solana-pay';

interface UseArcPricingResult {
  pricing: ArcPricing | null;
  loading: boolean;
  error: string | null;
  calculateArcPrice: (priceUsd: number) => number;
}

export function useArcPricing(): UseArcPricingResult {
  const [pricing, setPricing] = useState<ArcPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPricing() {
      try {
        const data = await getArcPricing();
        if (!cancelled) {
          setPricing(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to fetch ARC pricing');
          setLoading(false);
        }
      }
    }

    fetchPricing();
    return () => {
      cancelled = true;
    };
  }, []);

  const calculateArcPrice = (priceUsd: number): number => {
    if (!pricing || pricing.arcUsdPrice <= 0) return 0;

    const discountedUsd = priceUsd * (1 - pricing.discountPercent / 100);
    return Math.ceil(discountedUsd / pricing.arcUsdPrice);
  };

  return { pricing, loading, error, calculateArcPrice };
}
