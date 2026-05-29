import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { GameVariantOption } from '@/features/games/ui/GameVariantSelector';
import type { TicTacToeVariant } from '../types';

export interface TicTacToeVariantOption extends GameVariantOption {
  id: TicTacToeVariant;
  name: TranslationKey;
  description: TranslationKey;
  emoji: string;
  gradient: string;
  lightGradient: string;
}

export const TIC_TAC_TOE_VARIANTS: ReadonlyArray<TicTacToeVariantOption> = [
  {
    id: 'classic',
    name: 'games.tic_tac_toe_v1.variants.classic.name' as TranslationKey,
    description:
      'games.tic_tac_toe_v1.variants.classic.description' as TranslationKey,
    emoji: '❌',
    gradient: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
    lightGradient:
      'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
  },
  {
    id: 'neon',
    name: 'games.tic_tac_toe_v1.variants.neon.name' as TranslationKey,
    description:
      'games.tic_tac_toe_v1.variants.neon.description' as TranslationKey,
    emoji: '💡',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
    lightGradient:
      'linear-gradient(90deg, #fff 0%, #c084fc 40%, #67e8f9 80%, #fff 100%)',
  },
  {
    id: 'paper',
    name: 'games.tic_tac_toe_v1.variants.paper.name' as TranslationKey,
    description:
      'games.tic_tac_toe_v1.variants.paper.description' as TranslationKey,
    emoji: '📝',
    gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    lightGradient:
      'linear-gradient(90deg, #fff7ed 0%, #fed7aa 50%, #fff7ed 100%)',
  },
  {
    id: 'pixel',
    name: 'games.tic_tac_toe_v1.variants.pixel.name' as TranslationKey,
    description:
      'games.tic_tac_toe_v1.variants.pixel.description' as TranslationKey,
    emoji: '👾',
    gradient: 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
    lightGradient: 'linear-gradient(90deg, #fff 0%, #4ade80 50%, #fff 100%)',
  },
  {
    id: 'chalkboard',
    name: 'games.tic_tac_toe_v1.variants.chalkboard.name' as TranslationKey,
    description:
      'games.tic_tac_toe_v1.variants.chalkboard.description' as TranslationKey,
    emoji: '🎓',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    lightGradient:
      'linear-gradient(90deg, #475569 0%, #334155 50%, #475569 100%)',
  },
  {
    id: 'retro',
    name: 'games.tic_tac_toe_v1.variants.retro.name' as TranslationKey,
    description:
      'games.tic_tac_toe_v1.variants.retro.description' as TranslationKey,
    emoji: '📺',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    lightGradient:
      'linear-gradient(90deg, #fff 0%, #fcd34d 40%, #fca5a5 80%, #fff 100%)',
  },
];
