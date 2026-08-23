import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { GameVariantOption } from '@/features/games/ui/GameVariantSelector';
import type { GoBoardSize } from '../types';

import { SHARED_THEMES } from '@/features/games/lib/shared-themes';

export interface GoVariantOption extends GameVariantOption {
  id: string;
  name: TranslationKey;
  description: TranslationKey;
  emoji: string;
  gradient: string;
  lightGradient: string;
}

export const GO_VARIANTS: ReadonlyArray<GoVariantOption> = SHARED_THEMES.map(
  (t) => ({
    id: t.id,
    name: t.nameKey as TranslationKey,
    description: t.descriptionKey as TranslationKey,
    emoji: t.emoji,
    gradient: t.gradient,
    lightGradient: `linear-gradient(90deg, #fff 0%, ${t.colors.primary} 40%, ${t.colors.accent} 80%, #fff 100%)`,
  }),
);

export const GO_BOARD_SIZES: ReadonlyArray<{
  size: GoBoardSize;
  label: string;
}> = [
  { size: 9, label: '9×9' },
  { size: 13, label: '13×13' },
  { size: 19, label: '19×19' },
];
