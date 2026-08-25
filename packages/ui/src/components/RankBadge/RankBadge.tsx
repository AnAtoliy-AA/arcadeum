import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type RankBadgeTier =
  | 'mythic'
  | 'diamond'
  | 'platinum'
  | 'gold'
  | 'silver'
  | 'bronze';

const rankBadgeBase =
  'inline-flex px-2 py-1 rounded font-bold min-w-[36px] text-center border';

const rankTierClasses: Record<RankBadgeTier, string> = {
  mythic:
    'bg-[rgba(236,72,153,0.18)] text-[var(--mythicAccent)] border-[var(--mythicAccent)]',
  diamond:
    'bg-[rgba(34,211,238,0.16)] text-[var(--diamondAccent)] border-[var(--diamondAccent)]',
  platinum:
    'bg-[rgba(167,139,250,0.16)] text-[var(--platinumAccent)] border-[var(--platinumAccent)]',
  gold: 'bg-[rgba(250,204,21,0.16)] text-[var(--goldAccent)] border-[var(--goldAccent)]',
  silver:
    'bg-[rgba(148,163,184,0.16)] text-[var(--silverAccent)] border-[var(--silverAccent)]',
  bronze:
    'bg-[rgba(180,83,9,0.16)] text-[var(--bronzeAccent)] border-[var(--bronzeAccent)]',
};

export type RankBadgeProps = {
  tier?: RankBadgeTier;
  children?: ReactNode;
  className?: string;
};

export function RankBadge({ tier = 'gold', className, children }: RankBadgeProps) {
  return (
    <span className={cx(rankBadgeBase, rankTierClasses[tier], className)}>
      {children}
    </span>
  );
}
