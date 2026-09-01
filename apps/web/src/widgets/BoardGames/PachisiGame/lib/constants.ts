import { SHARED_THEMES } from '@/features/games/lib/shared-themes';
import type { PachisiTheme } from '../types';

export const PACHISI_THEMES: ReadonlyArray<{
  id: PachisiTheme;
  nameKey: string;
  descriptionKey: string;
  emoji: string;
}> = SHARED_THEMES.map((theme) => ({
  id: theme.id as PachisiTheme,
  nameKey: `games.themes.${theme.id}.name`,
  descriptionKey: `games.themes.${theme.id}.description`,
  emoji: theme.emoji,
}));
