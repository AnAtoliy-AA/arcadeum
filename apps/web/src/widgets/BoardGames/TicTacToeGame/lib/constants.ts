import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { GameVariantOption } from '@/features/games/ui/GameVariantSelector';
import type { TicTacToeTheme } from '../types';

export const INFINITY_MAX_BOARD_SIZE = 100;

export interface TicTacToeThemeOption extends GameVariantOption {
  id: TicTacToeTheme;
  name: TranslationKey;
  description: TranslationKey;
  emoji: string;
  gradient: string;
  lightGradient: string;
}

import { SHARED_THEMES } from '@/features/games/lib/shared-themes';

export const TIC_TAC_TOE_THEMES: ReadonlyArray<TicTacToeThemeOption> =
  SHARED_THEMES.map((t) => ({
    id: t.id as TicTacToeTheme,
    name: t.nameKey as TranslationKey,
    description: t.descriptionKey as TranslationKey,
    emoji: t.emoji,
    gradient: t.gradient,
    lightGradient: `linear-gradient(90deg, #fff 0%, ${t.colors.primary} 40%, ${t.colors.accent} 80%, #fff 100%)`,
  }));
