import { useEffect, useState } from 'react';
import { gamesApi } from '@/features/games/api';
import { isPetFeatureDisabled } from '../lib/arcade-pet-feature-flag';

/** True when the catalog turns the ArcadePet companion off for this user. */
export function useArcadePetFeatureDisabled(token?: string | null): boolean {
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    gamesApi
      .getCatalog({ token: token || undefined })
      .then((res) => {
        if (cancelled) return;
        setDisabled(isPetFeatureDisabled(res.games));
      })
      .catch(() => {
        // Fallback on network error: keep available
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return disabled;
}
