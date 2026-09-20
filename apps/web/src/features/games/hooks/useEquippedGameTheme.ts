'use client';

import { useMemo } from 'react';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import {
  skinIdToThemeId,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';

const THEME_IDS = SHARED_THEMES.filter((t) => t.id !== 'random').map(
  (t) => t.id,
);

export function useEquippedGameTheme(): string | undefined {
  const { snapshot } = useSessionTokens();
  return useMemo(() => {
    const themeId = skinIdToThemeId(snapshot.equippedGameSkinId);
    if (themeId && THEME_IDS.includes(themeId)) return themeId;
    return undefined;
  }, [snapshot.equippedGameSkinId]);
}
