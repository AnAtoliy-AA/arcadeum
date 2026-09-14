'use client';

import { useEffect, useCallback } from 'react';
import { soloRatingApi, type SoloRatingMe } from '@/shared/api/soloRating';
import { useSoloRatingStore } from '@/features/stats/store/soloRatingStore';

export interface UseSoloRatingResult {
  rating: SoloRatingMe | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useSoloRating(): UseSoloRatingResult {
  const { rating, loading, setRating, setLoading } = useSoloRatingStore();

  const fetchRating = useCallback(async () => {
    setLoading(true);
    try {
      const data = await soloRatingApi.getMyRating();
      setRating(data);
    } catch {
      // Silently fail — rating is not critical
    } finally {
      setLoading(false);
    }
  }, [setRating, setLoading]);

  useEffect(() => {
    void fetchRating();
  }, [fetchRating]);

  return { rating, loading, refresh: fetchRating };
}
