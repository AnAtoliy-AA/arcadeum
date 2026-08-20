import { SHARED_THEMES } from '@/features/games/lib/shared-themes';

export interface ChessThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
}

export const CHESS_THEMES: ChessThemeMeta[] = SHARED_THEMES.filter(
  (t) => t.id !== 'random',
).map((t) => ({
  id: t.id,
  name: t.id.charAt(0).toUpperCase() + t.id.slice(1).replace(/-/g, ' '),
  desc: t.descriptionKey,
  color: t.colors.primary,
}));

export function findChessTheme(id: string | undefined): ChessThemeMeta {
  return CHESS_THEMES.find((t) => t.id === id) ?? CHESS_THEMES[0];
}
