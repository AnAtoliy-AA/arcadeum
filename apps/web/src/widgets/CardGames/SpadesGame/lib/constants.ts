import { SHARED_THEMES } from '@/features/games/lib/shared-themes';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { GameVariantOption } from '@/features/games/ui/GameVariantSelector';
import type { SpadesVariant } from '../types';

export interface SpadesVariantOption extends GameVariantOption {
  id: SpadesVariant;
  name: TranslationKey;
  description: TranslationKey;
  emoji: string;
  gradient: string;
  lightGradient: string;
}

export const SPADES_VARIANTS: ReadonlyArray<SpadesVariantOption> =
  SHARED_THEMES.map((t) => ({
    id: t.id as SpadesVariant,
    name: t.nameKey as TranslationKey,
    description: t.descriptionKey as TranslationKey,
    emoji: t.emoji,
    gradient: t.gradient,
    lightGradient: `linear-gradient(90deg, #fff 0%, ${t.colors.primary} 40%, ${t.colors.accent} 80%, #fff 100%)`,
  }));
