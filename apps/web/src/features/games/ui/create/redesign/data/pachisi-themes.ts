import { SHARED_THEMES } from '@/features/games/lib/shared-themes';

export interface PachisiThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
}

export const PACHISI_THEMES: PachisiThemeMeta[] = SHARED_THEMES.filter(
  (t) => t.id !== 'random',
).map((t) => ({
  id: t.id,
  name: t.id.charAt(0).toUpperCase() + t.id.slice(1).replace(/-/g, ' '),
  desc: t.descriptionKey,
  color: t.colors.primary,
}));

export function findPachisiTheme(id: string | undefined): PachisiThemeMeta {
  return PACHISI_THEMES.find((t) => t.id === id) ?? PACHISI_THEMES[0];
}
