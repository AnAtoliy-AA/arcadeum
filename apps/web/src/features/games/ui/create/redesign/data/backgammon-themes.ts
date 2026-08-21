import { SHARED_THEMES } from '@/features/games/lib/shared-themes';

export interface BackgammonThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
}

export const BACKGAMMON_THEMES: BackgammonThemeMeta[] = SHARED_THEMES.filter(
  (t) => t.id !== 'random',
).map((t) => ({
  id: t.id,
  name: t.id.charAt(0).toUpperCase() + t.id.slice(1).replace(/-/g, ' '),
  desc: t.descriptionKey,
  color: t.colors.primary,
}));

export function findBackgammonTheme(
  id: string | undefined,
): BackgammonThemeMeta {
  return BACKGAMMON_THEMES.find((t) => t.id === id) ?? BACKGAMMON_THEMES[0];
}
