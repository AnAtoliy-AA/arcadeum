'use client';

import { useMemo } from 'react';
import { useSoloTheme } from '@/features/games/store/soloThemeStore';
import { useGameSound } from '@/shared/lib/game-sounds';
import { useSoloPause } from '@/features/games/ui/useSoloPause';
import { useSoloTimer } from '@/features/games/ui/SoloGameStats';
import type { UseBoundStore, StoreApi } from 'zustand';

export interface SoloGameResult<T> {
  state: {
    isRunning: boolean;
    startedAt: number;
    finishedAt: number | null;
  };
  actions: {
    newGame: () => void;
    play: (sound: string) => void;
  };
  themeId: string;
  pause: ReturnType<typeof useSoloPause>;
  timer: { elapsedMs: number; formatted: string };
  game: T;
}

interface SoloGameConfig<TState, TGame> {
  gameId: string;
  store: UseBoundStore<StoreApi<TState>> & { getState: () => TState };
  selectors: {
    isRunning: (state: TState) => boolean;
    startedAt: (state: TState) => number;
    finishedAt: (state: TState) => number | null;
    newGame: (state: TState) => () => void;
    game: (state: TState) => TGame;
  };
}

export function useSoloGame<TState, TGame>(
  config: SoloGameConfig<TState, TGame>,
): SoloGameResult<TGame> {
  const { gameId, store, selectors } = config;
  const { themeId } = useSoloTheme(gameId);
  const { play } = useGameSound(gameId);

  const isRunning = store(selectors.isRunning);
  const startedAt = store(selectors.startedAt);
  const finishedAt = store(selectors.finishedAt);
  const newGame = store(selectors.newGame);
  const game = store(selectors.game);

  const pause = useSoloPause(isRunning, finishedAt);
  const timer = useSoloTimer(isRunning, startedAt, pause.isPaused);

  return useMemo(
    () => ({
      state: { isRunning, startedAt, finishedAt },
      actions: { newGame, play: play as (sound: string) => void },
      themeId,
      pause,
      timer,
      game,
    }),
    [
      isRunning,
      startedAt,
      finishedAt,
      newGame,
      themeId,
      pause,
      timer,
      game,
      play,
    ],
  );
}
