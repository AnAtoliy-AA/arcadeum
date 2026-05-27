import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { GameVariantOption } from '@/features/games/ui/GameVariantSelector';
import type { CascadeMode, CascadeVariant } from '../types';

export interface CascadeVariantOption extends GameVariantOption {
  id: CascadeVariant;
  name: TranslationKey;
  description: TranslationKey;
  emoji: string;
  gradient: string;
  lightGradient: string;
}

export const CASCADE_VARIANTS: ReadonlyArray<CascadeVariantOption> = [
  {
    id: 'cosmic',
    name: 'games.cascade_v1.variants.cosmic.name' as TranslationKey,
    description:
      'games.cascade_v1.variants.cosmic.description' as TranslationKey,
    emoji: '🌌',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0c0a1e 100%)',
    lightGradient:
      'linear-gradient(90deg, #ede9fe 0%, #c4b5fd 50%, #ede9fe 100%)',
  },
  {
    id: 'arcane',
    name: 'games.cascade_v1.variants.arcane.name' as TranslationKey,
    description:
      'games.cascade_v1.variants.arcane.description' as TranslationKey,
    emoji: '✨',
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #be185d 50%, #1e293b 100%)',
    lightGradient:
      'linear-gradient(90deg, #fae8ff 0%, #f0abfc 50%, #fae8ff 100%)',
  },
  {
    id: 'cyberpunk',
    name: 'games.cascade_v1.variants.cyberpunk.name' as TranslationKey,
    description:
      'games.cascade_v1.variants.cyberpunk.description' as TranslationKey,
    emoji: '💾',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #0891b2 50%, #be185d 100%)',
    lightGradient:
      'linear-gradient(90deg, #f0fdfa 0%, #67e8f9 50%, #f0fdfa 100%)',
  },
  {
    id: 'elemental',
    name: 'games.cascade_v1.variants.elemental.name' as TranslationKey,
    description:
      'games.cascade_v1.variants.elemental.description' as TranslationKey,
    emoji: '🍃',
    gradient: 'linear-gradient(135deg, #166534 0%, #ca8a04 50%, #1e40af 100%)',
    lightGradient:
      'linear-gradient(90deg, #ecfdf5 0%, #a7f3d0 50%, #ecfdf5 100%)',
  },
];

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
    description:
      'games.cascade_v1.modes.classic.description' as TranslationKey,
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
