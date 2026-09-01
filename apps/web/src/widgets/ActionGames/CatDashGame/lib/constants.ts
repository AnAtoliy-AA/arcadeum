import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { GameVariantOption } from '@/features/games/ui/GameVariantSelector';
import type { CatDashTheme } from '../types';

export interface CatDashThemeOption extends GameVariantOption {
  id: CatDashTheme;
  name: TranslationKey;
  description: TranslationKey;
  emoji: string;
  gradient: string;
  lightGradient: string;
}

import { SHARED_THEMES } from '@/features/games/lib/shared-themes';

export const CAT_DASH_THEMES: ReadonlyArray<CatDashThemeOption> =
  SHARED_THEMES.map((t) => ({
    id: t.id as CatDashTheme,
    name: t.nameKey as TranslationKey,
    description: t.descriptionKey as TranslationKey,
    emoji: t.emoji,
    gradient: t.gradient,
    lightGradient: `linear-gradient(90deg, #fff 0%, ${t.colors.primary} 40%, ${t.colors.accent} 80%, #fff 100%)`,
  }));
