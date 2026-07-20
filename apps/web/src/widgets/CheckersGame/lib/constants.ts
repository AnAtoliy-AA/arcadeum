import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { GameVariantOption } from '@/features/games/ui/GameVariantSelector';
import type { CheckersVariant } from '../types';

export interface CheckersVariantOption extends GameVariantOption {
  id: CheckersVariant;
  name: TranslationKey;
  description: TranslationKey;
  emoji: string;
  gradient: string;
  lightGradient: string;
}

export const CHECKERS_VARIANTS: ReadonlyArray<CheckersVariantOption> = [
  {
    id: 'classic',
    name: 'games.checkers_v1.variants.classic.name' as TranslationKey,
    description: 'games.checkers_v1.variants.classic.description' as TranslationKey,
    emoji: '♟️',
    gradient: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
    lightGradient: 'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
  },
  {
    id: 'neon',
    name: 'games.checkers_v1.variants.neon.name' as TranslationKey,
    description: 'games.checkers_v1.variants.neon.description' as TranslationKey,
    emoji: '💡',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
    lightGradient: 'linear-gradient(90deg, #fff 0%, #c084fc 40%, #67e8f9 80%, #fff 100%)',
  },
  {
    id: 'wood',
    name: 'games.checkers_v1.variants.wood.name' as TranslationKey,
    description: 'games.checkers_v1.variants.wood.description' as TranslationKey,
    emoji: '🪵',
    gradient: 'linear-gradient(135deg, #92400e 0%, #b45309 100%)',
    lightGradient: 'linear-gradient(90deg, #fff7ed 0%, #fed7aa 50%, #fff7ed 100%)',
  },
  {
    id: 'marble',
    name: 'games.checkers_v1.variants.marble.name' as TranslationKey,
    description: 'games.checkers_v1.variants.marble.description' as TranslationKey,
    emoji: '🏛️',
    gradient: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
    lightGradient: 'linear-gradient(90deg, #f8fafc 0%, #cbd5e1 50%, #f8fafc 100%)',
  },
  {
    id: 'neon_glow',
    name: 'games.checkers_v1.variants.neon_glow.name' as TranslationKey,
    description: 'games.checkers_v1.variants.neon_glow.description' as TranslationKey,
    emoji: '🌟',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    lightGradient: 'linear-gradient(90deg, #0f172a 0%, #4338ca 40%, #7c3aed 80%, #0f172a 100%)',
  },
];
