import { SHARED_THEMES } from '@/features/games/lib/shared-themes';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { GameVariantOption } from '@/features/games/ui/GameVariantSelector';

export const CHESS_MODES = [
  { id: 'standard', name: 'Standard' },
  { id: 'chess960', name: 'Chess960' },
] as const;

export interface ChessThemeOption extends GameVariantOption {
  id: string;
  name: TranslationKey;
  description: TranslationKey;
  emoji: string;
  gradient: string;
  lightGradient: string;
}

export const CHESS_THEMES: ReadonlyArray<ChessThemeOption> = SHARED_THEMES.map(
  (t) => ({
    id: t.id,
    name: t.nameKey as TranslationKey,
    description: t.descriptionKey as TranslationKey,
    emoji: t.emoji,
    gradient: t.gradient,
    lightGradient: `linear-gradient(90deg, #fff 0%, ${t.colors.primary} 40%, ${t.colors.accent} 80%, #fff 100%)`,
  }),
);
