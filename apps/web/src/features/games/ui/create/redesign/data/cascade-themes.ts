import { SHARED_THEMES } from '@/features/games/lib/shared-themes';

export interface CascadeThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
}

export const CASCADE_THEMES: CascadeThemeMeta[] = SHARED_THEMES.filter(
  (t) => t.id !== 'random',
).map((t) => ({
  id: t.id,
  name: t.id.charAt(0).toUpperCase() + t.id.slice(1).replace(/-/g, ' '),
  desc: t.descriptionKey,
  color: t.colors.primary,
}));

export function findCascadeTheme(id: string | undefined): CascadeThemeMeta {
  return CASCADE_THEMES.find((t) => t.id === id) ?? CASCADE_THEMES[0];
}
