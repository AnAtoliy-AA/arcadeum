import { SHARED_THEMES } from '@/features/games/lib/shared-themes';
import type { BackgammonVariant } from '../types';

export const BACKGAMMON_VARIANTS: ReadonlyArray<{
  id: BackgammonVariant;
  nameKey: string;
  descriptionKey: string;
  emoji: string;
}> = SHARED_THEMES.map((theme) => ({
  id: theme.id as BackgammonVariant,
  nameKey: `games.themes.${theme.id}.name`,
  descriptionKey: `games.themes.${theme.id}.description`,
  emoji: theme.emoji,
}));
