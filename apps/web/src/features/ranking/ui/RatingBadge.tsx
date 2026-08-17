'use client';

import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { cx } from '@arcadeum/ui/utils/cx';
import type { RankingTier } from '../model/types';
import { tierMeta } from '../lib/tiers';

export interface RatingBadgeProps {
  elo?: number | null;
  tier?: RankingTier | null;
  delta?: number | null;
  className?: string;
  size?: 'sm' | 'md';
  /** Show the numeric rating next to the tier label. */
  showElo?: boolean;
}

/**
 * Ranked-tier pill used in lobbies, room cards and the result modal.
 * Renders the tier label (+ optional elo / signed delta) with a
 * tier-colored accent.
 */
export function RatingBadge({
  elo,
  tier,
  delta,
  className,
  size = 'sm',
  showElo = true,
}: RatingBadgeProps) {
  const { t } = useTranslation();
  const meta = tierMeta(tier ?? null);
  const tierLabel =
    t(`games.ranking.tier.${meta.tier}` as TranslationKey) || meta.label;

  const base = cx(
    'inline-flex items-center gap-1 rounded-full border font-semibold whitespace-nowrap',
    meta.badge,
    size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[13px]',
    className,
  );

  return (
    <span className={base} data-testid="rating-badge">
      <span aria-hidden="true">★</span>
      <span>{tierLabel}</span>
      {showElo && typeof elo === 'number' && (
        <span className="opacity-90" data-testid="rating-elo">
          {elo}
        </span>
      )}
      {typeof delta === 'number' && delta !== 0 && (
        <span
          data-testid="rating-delta"
          className={cx(
            'font-bold',
            delta > 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]',
          )}
        >
          {delta > 0 ? `+${delta}` : delta}
        </span>
      )}
    </span>
  );
}
