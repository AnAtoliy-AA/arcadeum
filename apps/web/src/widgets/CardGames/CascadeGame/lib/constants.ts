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
  {
    id: 'classic',
    name: 'games.cascade_v1.variants.classic.name' as TranslationKey,
    description:
      'games.cascade_v1.variants.classic.description' as TranslationKey,
    emoji: '🃏',
    gradient: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #172554 100%)',
    lightGradient:
      'linear-gradient(90deg, #dbeafe 0%, #93c5fd 50%, #dbeafe 100%)',
  },
  {
    id: 'neon',
    name: 'games.cascade_v1.variants.neon.name' as TranslationKey,
    description: 'games.cascade_v1.variants.neon.description' as TranslationKey,
    emoji: '💜',
    gradient: 'linear-gradient(135deg, #2e1065 0%, #7c3aed 50%, #0f0a1e 100%)',
    lightGradient:
      'linear-gradient(90deg, #f5f3ff 0%, #c4b5fd 50%, #f5f3ff 100%)',
  },
  {
    id: 'tropical',
    name: 'games.cascade_v1.variants.tropical.name' as TranslationKey,
    description:
      'games.cascade_v1.variants.tropical.description' as TranslationKey,
    emoji: '🏖️',
    gradient: 'linear-gradient(135deg, #065f46 0%, #0ea5e9 50%, #164e63 100%)',
    lightGradient:
      'linear-gradient(90deg, #ecfdf5 0%, #99f6e4 50%, #ecfdf5 100%)',
  },
  {
    id: 'steampunk',
    name: 'games.cascade_v1.variants.steampunk.name' as TranslationKey,
    description:
      'games.cascade_v1.variants.steampunk.description' as TranslationKey,
    emoji: '⚙️',
    gradient: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #1c1917 100%)',
    lightGradient:
      'linear-gradient(90deg, #fef3c7 0%, #fcd34d 50%, #fef3c7 100%)',
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
