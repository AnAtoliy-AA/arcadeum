import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { GameVariantOption } from '@/features/games/ui/GameVariantSelector';
import type { CatDashVariant } from '../types';

export interface CatDashVariantOption extends GameVariantOption {
  id: CatDashVariant;
  name: TranslationKey;
  description: TranslationKey;
  emoji: string;
  gradient: string;
  lightGradient: string;
}

export const CAT_DASH_VARIANTS: ReadonlyArray<CatDashVariantOption> = [
  {
    id: 'neon',
    name: 'games.cat_dash_v1.variants.neon.name' as TranslationKey,
    description:
      'games.cat_dash_v1.variants.neon.description' as TranslationKey,
    emoji: '🐱',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
    lightGradient:
      'linear-gradient(90deg, #fff 0%, #c084fc 40%, #67e8f9 80%, #fff 100%)',
  },
  {
    id: 'village',
    name: 'games.cat_dash_v1.variants.village.name' as TranslationKey,
    description:
      'games.cat_dash_v1.variants.village.description' as TranslationKey,
    emoji: '🏘️',
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    lightGradient:
      'linear-gradient(90deg, #fff 0%, #6ee7b7 40%, #a7f3d0 80%, #fff 100%)',
  },
  {
    id: 'space',
    name: 'games.cat_dash_v1.variants.space.name' as TranslationKey,
    description:
      'games.cat_dash_v1.variants.space.description' as TranslationKey,
    emoji: '🚀',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
    lightGradient:
      'linear-gradient(90deg, #0f172a 0%, #312e81 50%, #0f172a 100%)',
  },
  {
    id: 'nature',
    name: 'games.cat_dash_v1.variants.nature.name' as TranslationKey,
    description:
      'games.cat_dash_v1.variants.nature.description' as TranslationKey,
    emoji: '🌿',
    gradient: 'linear-gradient(135deg, #166534 0%, #15803d 50%, #22c55e 100%)',
    lightGradient:
      'linear-gradient(90deg, #fff 0%, #86efac 40%, #bbf7d0 80%, #fff 100%)',
  },
];
