import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { GameVariantOption } from '@/features/games/ui/GameVariantSelector';
import type { HeartsVariant } from '../types';

export interface HeartsVariantOption extends GameVariantOption {
  id: HeartsVariant;
  name: TranslationKey;
  description: TranslationKey;
  emoji: string;
  gradient: string;
  lightGradient: string;
}

import { SHARED_THEMES } from '@/features/games/lib/shared-themes';

export const HEARTS_VARIANTS: ReadonlyArray<HeartsVariantOption> =
  SHARED_THEMES.map((t) => ({
    id: t.id as HeartsVariant,
    name: t.nameKey as TranslationKey,
    description: t.descriptionKey as TranslationKey,
    emoji: t.emoji,
    gradient: t.gradient,
    lightGradient: `linear-gradient(90deg, #fff 0%, ${t.colors.primary} 40%, ${t.colors.accent} 80%, #fff 100%)`,
  }));

export const PASS_DIRECTION_LABELS: Record<string, TranslationKey> = {
  left: 'games.hearts_v1.passDirection.left' as TranslationKey,
  right: 'games.hearts_v1.passDirection.right' as TranslationKey,
  across: 'games.hearts_v1.passDirection.across' as TranslationKey,
  hold: 'games.hearts_v1.passDirection.hold' as TranslationKey,
};
