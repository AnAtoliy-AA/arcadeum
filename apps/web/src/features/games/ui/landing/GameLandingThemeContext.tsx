'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { SHARED_THEMES } from '@/features/games/lib/shared-themes';
import { useEquippedGameTheme } from '@/features/games/hooks/useEquippedGameTheme';

/** Theme ids a landing preview can cycle through (excludes `random`). */
export const LANDING_THEME_IDS: readonly string[] = SHARED_THEMES.filter(
  (t) => t.id !== 'random',
).map((t) => t.id);

export const DEFAULT_LANDING_THEME: string =
  LANDING_THEME_IDS[0] ?? 'adventure';

export interface GameLandingThemeValue {
  theme: string;
  setTheme: (theme: string) => void;
  cycleTheme: () => void;
  cyclePrevTheme: () => void;
}

const GameLandingThemeContext = createContext<GameLandingThemeValue>({
  theme: DEFAULT_LANDING_THEME,
  setTheme: () => {},
  cycleTheme: () => {},
  cyclePrevTheme: () => {},
});

export function GameLandingThemeProvider({
  children,
  initialTheme,
  theme: controlledTheme,
  onThemeChange,
}: {
  children: ReactNode;
  initialTheme?: string;
  theme?: string;
  onThemeChange?: (theme: string) => void;
}) {
  const equippedTheme = useEquippedGameTheme();
  const fallback = equippedTheme ?? DEFAULT_LANDING_THEME;
  const resolvedInitial =
    initialTheme && LANDING_THEME_IDS.includes(initialTheme)
      ? initialTheme
      : fallback;

  const [internalTheme, setInternalTheme] = useState<string>(resolvedInitial);

  const activeTheme =
    controlledTheme !== undefined ? controlledTheme : internalTheme;

  const value = useMemo<GameLandingThemeValue>(
    () => ({
      theme: activeTheme,
      setTheme: (next) => {
        setInternalTheme(next);
        onThemeChange?.(next);
      },
      cycleTheme: () => {
        const idx = LANDING_THEME_IDS.indexOf(activeTheme);
        const next =
          LANDING_THEME_IDS[(idx + 1) % LANDING_THEME_IDS.length] ??
          LANDING_THEME_IDS[0] ??
          activeTheme;
        setInternalTheme(next);
        onThemeChange?.(next);
      },
      cyclePrevTheme: () => {
        const idx = LANDING_THEME_IDS.indexOf(activeTheme);
        const prev =
          LANDING_THEME_IDS[
            (idx - 1 + LANDING_THEME_IDS.length) % LANDING_THEME_IDS.length
          ] ??
          LANDING_THEME_IDS[0] ??
          activeTheme;
        setInternalTheme(prev);
        onThemeChange?.(prev);
      },
    }),
    [activeTheme, onThemeChange],
  );

  return (
    <GameLandingThemeContext.Provider value={value}>
      {children}
    </GameLandingThemeContext.Provider>
  );
}

export function useGameLandingTheme(): GameLandingThemeValue {
  return useContext(GameLandingThemeContext);
}
