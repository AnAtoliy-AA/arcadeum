import { SHARED_THEMES } from '@/features/games/lib/shared-themes';

export interface GoThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
}

export const GO_THEMES: GoThemeMeta[] = SHARED_THEMES.filter(
  (t) => t.id !== 'random',
).map((t) => ({
  id: t.id,
  name: t.id.charAt(0).toUpperCase() + t.id.slice(1).replace(/-/g, ' '),
  desc: t.descriptionKey,
  color: t.colors.primary,
}));

export function findGoTheme(id: string | undefined): GoThemeMeta {
  return GO_THEMES.find((t) => t.id === id) ?? GO_THEMES[0];
}
