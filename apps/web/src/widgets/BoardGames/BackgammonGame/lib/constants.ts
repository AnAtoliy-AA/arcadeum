import { SHARED_THEMES } from '@/features/games/lib/shared-themes';
import type { BackgammonTheme } from '../types';

export const BACKGAMMON_THEMES: ReadonlyArray<{
  id: BackgammonTheme;
  nameKey: string;
  descriptionKey: string;
  emoji: string;
}> = SHARED_THEMES.map((theme) => ({
  id: theme.id as BackgammonTheme,
  nameKey: `games.themes.${theme.id}.name`,
  descriptionKey: `games.themes.${theme.id}.description`,
  emoji: theme.emoji,
}));
