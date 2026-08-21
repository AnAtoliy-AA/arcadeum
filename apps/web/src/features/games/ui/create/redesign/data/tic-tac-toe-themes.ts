import { SHARED_THEMES } from '@/features/games/lib/shared-themes';

export interface TicTacToeThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
}

export const TIC_TAC_TOE_THEMES: TicTacToeThemeMeta[] = SHARED_THEMES.filter(
  (t) => t.id !== 'random',
).map((t) => ({
  id: t.id,
  name: t.id.charAt(0).toUpperCase() + t.id.slice(1).replace(/-/g, ' '),
  desc: t.descriptionKey,
  color: t.colors.primary,
}));

export function findTicTacToeTheme(id: string | undefined): TicTacToeThemeMeta {
  return TIC_TAC_TOE_THEMES.find((t) => t.id === id) ?? TIC_TAC_TOE_THEMES[0];
}
