import { SHARED_THEMES } from '@/features/games/lib/shared-themes';

export interface CheckersThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
}

export const CHECKERS_THEMES: CheckersThemeMeta[] = SHARED_THEMES.filter(
  (t) => t.id !== 'random',
).map((t) => ({
  id: t.id,
  name: t.id.charAt(0).toUpperCase() + t.id.slice(1).replace(/-/g, ' '),
  desc: t.descriptionKey,
  color: t.colors.primary,
}));

export function findCheckersTheme(id: string | undefined): CheckersThemeMeta {
  return CHECKERS_THEMES.find((t) => t.id === id) ?? CHECKERS_THEMES[0];
}
