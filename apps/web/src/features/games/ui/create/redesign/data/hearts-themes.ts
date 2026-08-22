import { SHARED_THEMES } from '@/features/games/lib/shared-themes';

export interface HeartsThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
  accent: string;
}

export const HEARTS_THEMES: HeartsThemeMeta[] = SHARED_THEMES.filter(
  (t) => t.id !== 'random',
).map((t) => ({
  id: t.id,
  name: t.id.charAt(0).toUpperCase() + t.id.slice(1).replace(/-/g, ' '),
  desc: t.descriptionKey,
  color: t.colors.primary,
  accent: t.colors.accent,
}));

export function findHeartsTheme(id: string | undefined): HeartsThemeMeta {
  return HEARTS_THEMES.find((t) => t.id === id) ?? HEARTS_THEMES[0];
}
