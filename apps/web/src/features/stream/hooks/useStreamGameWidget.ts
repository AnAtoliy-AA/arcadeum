'use client';

import { useEffect, useState } from 'react';
import { gameFactory } from '@/features/games/lib/gameFactory';
import { mapToGameType } from '@/features/games/lib/gameIdMapping';
import { gameMetadata } from '@/features/games/registry';
import type { BaseGameWidgetProps } from '@/features/games';

/**
 * Lazy-loads the widget for a game id, the same way the room page does, and
 * returns the component once ready. Never throws: a failed load just leaves
 * the board empty until the next attempt.
 */
export function useStreamGameWidget(gameId: string | undefined) {
  const gameType = mapToGameType(gameId);
  const [loaded, setLoaded] = useState<{
    gameType: string;
    Widget: React.ComponentType<BaseGameWidgetProps>;
  } | null>(null);

  useEffect(() => {
    if (!gameType) return undefined;
    for (const metadata of Object.values(gameMetadata)) {
      if (metadata && !gameFactory.getGameMetadata(metadata.slug)) {
        gameFactory.registerGameMetadata(metadata);
      }
    }
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      try {
        await gameFactory.loadGame(gameType);
        const Widget = gameFactory.getLoadedGame(gameType);
        if (alive && Widget) setLoaded({ gameType, Widget });
      } catch {
        if (alive) timer = setTimeout(() => void load(), 3000);
      }
    };
    void load();

    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [gameType]);

  return loaded && loaded.gameType === gameType ? loaded.Widget : null;
}
