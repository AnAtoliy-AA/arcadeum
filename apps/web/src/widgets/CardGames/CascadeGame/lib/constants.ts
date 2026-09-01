import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { GameVariantOption } from '@/features/games/ui/GameVariantSelector';
import type { CascadeMode, CascadeTheme } from '../types';

export interface CascadeThemeOption extends GameVariantOption {
  id: CascadeTheme;
  name: TranslationKey;
  description: TranslationKey;
  emoji: string;
  gradient: string;
  lightGradient: string;
}

import { SHARED_THEMES } from '@/features/games/lib/shared-themes';

export const CASCADE_THEMES: ReadonlyArray<CascadeThemeOption> =
  SHARED_THEMES.map((t) => ({
    id: t.id as CascadeTheme,
    name: t.nameKey as TranslationKey,
    description: t.descriptionKey as TranslationKey,
    emoji: t.emoji,
    gradient: t.gradient,
    lightGradient: `linear-gradient(90deg, #fff 0%, ${t.colors.primary} 40%, ${t.colors.accent} 80%, #fff 100%)`,
  }));

export interface CascadeModeOption {
  id: CascadeMode;
  name: TranslationKey;
  description: TranslationKey;
  emoji: string;
}

export const CASCADE_MODES: ReadonlyArray<CascadeModeOption> = [
  {
    id: 'classic',
    name: 'games.cascade_v1.modes.classic.name' as TranslationKey,
    description: 'games.cascade_v1.modes.classic.description' as TranslationKey,
    emoji: '🎯',
  },
  {
    id: 'pure',
    name: 'games.cascade_v1.modes.pure.name' as TranslationKey,
    description: 'games.cascade_v1.modes.pure.description' as TranslationKey,
    emoji: '🧼',
  },
  {
    id: 'speed',
    name: 'games.cascade_v1.modes.speed.name' as TranslationKey,
    description: 'games.cascade_v1.modes.speed.description' as TranslationKey,
    emoji: '⚡',
  },
];
