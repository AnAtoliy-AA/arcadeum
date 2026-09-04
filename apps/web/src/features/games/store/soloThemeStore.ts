'use client';

import { useMemo, useCallback } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  SHARED_THEMES,
  getThemeById,
  type GameTheme,
} from '@/features/games/lib/shared-themes';

interface SoloThemeState {
  themes: Record<string, string>;
  setTheme: (gameId: string, themeId: string) => void;
  getTheme: (gameId: string) => string;
}

const DEFAULT_THEME_ID = SHARED_THEMES[0]?.id ?? 'adventure';

export const useSoloThemeStore = create<SoloThemeState>()(
  persist(
    (set, get) => ({
      themes: {},
      setTheme: (gameId, themeId) => {
        set((state) => ({
          themes: {
            ...state.themes,
            [gameId]: themeId,
          },
        }));
      },
      getTheme: (gameId) => {
        return get().themes[gameId] ?? DEFAULT_THEME_ID;
      },
    }),
    {
      name: 'arcadeum_solo_themes',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useSoloTheme(gameId: string): {
  themeId: string;
  setThemeId: (themeId: string) => void;
  theme: GameTheme;
} {
  const themeId = useSoloThemeStore(
    (state) => state.themes[gameId] ?? DEFAULT_THEME_ID,
  );
  const setThemeInStore = useSoloThemeStore((state) => state.setTheme);

  const setThemeId = useCallback(
    (newThemeId: string) => {
      setThemeInStore(gameId, newThemeId);
    },
    [gameId, setThemeInStore],
  );

  const theme = useMemo(() => {
    return getThemeById(themeId) ?? SHARED_THEMES[0];
  }, [themeId]);

  return { themeId, setThemeId, theme };
}
