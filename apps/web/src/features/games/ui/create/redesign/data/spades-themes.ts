import { SHARED_THEMES } from '@/features/games/lib/shared-themes';

export interface SpadesThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
  accent: string;
}

export const SPADES_THEMES: SpadesThemeMeta[] = SHARED_THEMES.filter(
  (t) => t.id !== 'random',
).map((t) => ({
  id: t.id,
  name: t.id.charAt(0).toUpperCase() + t.id.slice(1).replace(/-/g, ' '),
  desc: t.descriptionKey,
  color: t.colors.primary,
  accent: t.colors.accent,
}));

export function findSpadesTheme(id: string | undefined): SpadesThemeMeta {
  return SPADES_THEMES.find((t) => t.id === id) ?? SPADES_THEMES[0];
}
