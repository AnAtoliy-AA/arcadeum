import { SHARED_THEMES } from '@/features/games/lib/shared-themes';

export interface CatDashThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
}

export const CAT_DASH_THEMES: CatDashThemeMeta[] = SHARED_THEMES.filter(
  (t) => t.id !== 'random',
).map((t) => ({
  id: t.id,
  name: t.id.charAt(0).toUpperCase() + t.id.slice(1).replace(/-/g, ' '),
  desc: t.descriptionKey,
  color: t.colors.primary,
}));

export function findCatDashTheme(id: string | undefined): CatDashThemeMeta {
  return CAT_DASH_THEMES.find((t) => t.id === id) ?? CAT_DASH_THEMES[0];
}
