import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { GameVariantOption } from '@/features/games/ui/GameVariantSelector';
import type { GoBoardSize, GoOptions } from '../types';

import { SHARED_THEMES } from '@/features/games/lib/shared-themes';

export interface GoVariantOption extends GameVariantOption {
  id: string;
  name: TranslationKey;
  description: TranslationKey;
  emoji: string;
  gradient: string;
  lightGradient: string;
}

export const GO_VARIANTS: ReadonlyArray<GoVariantOption> = SHARED_THEMES.map(
  (t) => ({
    id: t.id,
    name: t.nameKey as TranslationKey,
    description: t.descriptionKey as TranslationKey,
    emoji: t.emoji,
    gradient: t.gradient,
    lightGradient: `linear-gradient(90deg, #fff 0%, ${t.colors.primary} 40%, ${t.colors.accent} 80%, #fff 100%)`,
  }),
);

export const GO_BOARD_SIZES: ReadonlyArray<{
  size: GoBoardSize;
  label: string;
}> = [
  { size: 9, label: '9×9' },
  { size: 13, label: '13×13' },
  { size: 19, label: '19×19' },
];

/** Komi paid to white — must match BE `go.constants.KOMI`. */
export const GO_KOMI = 7.5;

const ALLOWED_BOARD_SIZES: ReadonlyArray<number> = GO_BOARD_SIZES.map(
  ({ size }) => size,
);

/** Sanitize raw room game options into a safe GoOptions shape. */
export function resolveGoOptions(raw: unknown): GoOptions {
  const r = (raw ?? {}) as Partial<{
    theme: string;
    variant: string;
    boardSize: number;
  }>;
  const boardSize = ALLOWED_BOARD_SIZES.includes(Number(r.boardSize))
    ? (Number(r.boardSize) as GoBoardSize)
    : 9;
  const theme = r.theme ?? r.variant ?? 'adventure';
  return {
    variant: theme,
    theme,
    boardSize,
  };
}
