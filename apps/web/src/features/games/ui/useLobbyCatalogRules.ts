'use client';

import { useEffect, useState } from 'react';
import { gamesApi } from '@/features/games/api';

/** Loads which rules of the game are flagged "coming soon" in the catalog. */
export function useLobbyCatalogRules(
  gameId: string,
  onChange?: (map: Map<string, boolean>) => void,
) {
  const [ruleComingSoon, setRuleComingSoon] = useState<Map<string, boolean>>(
    new Map(),
  );
  useEffect(() => {
    gamesApi
      .getCatalog()
      .then((catalog) => {
        const game = catalog.games.find((g) => g.gameId === gameId);
        if (!game) return;
        const map = new Map<string, boolean>();
        for (const r of game.rules) map.set(r.ruleId, r.comingSoon);
        setRuleComingSoon(map);
        onChange?.(map);
      })
      .catch(() => {});
  }, [gameId, onChange]);
  return ruleComingSoon;
}
