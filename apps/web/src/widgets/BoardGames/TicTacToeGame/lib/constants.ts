import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { GameVariantOption } from '@/features/games/ui/GameVariantSelector';
import type { TicTacToeVariant } from '../types';

export const INFINITY_MAX_BOARD_SIZE = 100;

export interface TicTacToeVariantOption extends GameVariantOption {
  id: TicTacToeVariant;
  name: TranslationKey;
  description: TranslationKey;
  emoji: string;
  gradient: string;
  lightGradient: string;
}

import { SHARED_THEMES } from '@/features/games/lib/shared-themes';

export const TIC_TAC_TOE_VARIANTS: ReadonlyArray<TicTacToeVariantOption> =
  SHARED_THEMES.map((t) => ({
    id: t.id as TicTacToeVariant,
    name: t.nameKey as TranslationKey,
    description: t.descriptionKey as TranslationKey,
    emoji: t.emoji,
    gradient: t.gradient,
    lightGradient: `linear-gradient(90deg, #fff 0%, ${t.colors.primary} 40%, ${t.colors.accent} 80%, #fff 100%)`,
  }));
