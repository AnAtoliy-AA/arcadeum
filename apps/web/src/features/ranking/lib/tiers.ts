import type { RankingTier } from '../model/types';

export interface RankingTierMeta {
  tier: RankingTier;
  /** Inclusive lower bound for the tier. Mirrors the backend constants. */
  min: number;
  label: string;
  /** Tailwind classes for the badge accent (mirrors RankBadge styling). */
  badge: string;
}

export const RANKING_TIERS: RankingTierMeta[] = [
  {
    tier: 'master',
    min: 2000,
    label: 'Master',
    badge:
      'bg-[rgba(250,204,21,0.18)] text-[#ffd700] border-[#ffd700] shadow-[0_0_12px_rgba(255,215,0,0.35)]',
  },
  {
    tier: 'diamond',
    min: 1800,
    label: 'Diamond',
    badge:
      'bg-[rgba(34,211,238,0.16)] text-[var(--diamondAccent)] border-[var(--diamondAccent)]',
  },
  {
    tier: 'platinum',
    min: 1600,
    label: 'Platinum',
    badge:
      'bg-[rgba(167,139,250,0.16)] text-[var(--platinumAccent)] border-[var(--platinumAccent)]',
  },
  {
    tier: 'gold',
    min: 1400,
    label: 'Gold',
    badge:
      'bg-[rgba(250,204,21,0.16)] text-[var(--goldAccent)] border-[var(--goldAccent)]',
  },
  {
    tier: 'silver',
    min: 1200,
    label: 'Silver',
    badge:
      'bg-[rgba(148,163,184,0.16)] text-[var(--silverAccent)] border-[var(--silverAccent)]',
  },
  {
    tier: 'bronze',
    min: 0,
    label: 'Bronze',
    badge:
      'bg-[rgba(180,83,9,0.16)] text-[var(--bronzeAccent)] border-[var(--bronzeAccent)]',
  },
];

export function tierForRating(rating: number): RankingTier {
  for (const def of RANKING_TIERS) {
    if (rating >= def.min) return def.tier;
  }
  return 'bronze';
}

export function tierMeta(
  tier: RankingTier | undefined | null,
): RankingTierMeta {
  return (
    RANKING_TIERS.find((t) => t.tier === tier) ??
    RANKING_TIERS[RANKING_TIERS.length - 1] ??
    RANKING_TIERS[0]
  );
}
