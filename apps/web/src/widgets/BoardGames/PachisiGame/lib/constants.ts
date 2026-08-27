import { SHARED_THEMES } from '@/features/games/lib/shared-themes';
import type { PachisiVariant } from '../types';

export const PACHISI_VARIANTS: ReadonlyArray<{
  id: PachisiVariant;
  nameKey: string;
  descriptionKey: string;
  emoji: string;
}> = SHARED_THEMES.map((theme) => ({
  id: theme.id as PachisiVariant,
  nameKey: `games.themes.${theme.id}.name`,
  descriptionKey: `games.themes.${theme.id}.description`,
  emoji: theme.emoji,
}));
