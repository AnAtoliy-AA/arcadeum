export const STARTING_ELO = 1200;
export const ELO_K = 32;
export const ELO_DIVISOR = 400;

export const RANKING_TIER_VALUES = [
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
  'master',
] as const;

export type RankingTier = (typeof RANKING_TIER_VALUES)[number];

export interface RankingTierDef {
  tier: RankingTier;
  /** Inclusive lower bound for the tier. */
  min: number;
}

/**
 * Tier thresholds, highest first. Matches the roadmap:
 * Bronze (0-1199), Silver (1200-1399), Gold (1400-1599),
 * Platinum (1600-1799), Diamond (1800-1999), Master (2000+).
 */
export const RANKING_TIERS: RankingTierDef[] = [
  { tier: 'master', min: 2000 },
  { tier: 'diamond', min: 1800 },
  { tier: 'platinum', min: 1600 },
  { tier: 'gold', min: 1400 },
  { tier: 'silver', min: 1200 },
  { tier: 'bronze', min: 0 },
];

export function tierForRating(rating: number): RankingTier {
  for (const def of RANKING_TIERS) {
    if (rating >= def.min) return def.tier;
  }
  return 'bronze';
}

/** Quarterly season stamp, e.g. `2026Q3` — mirrors the leaderboards season. */
export function currentSeason(date: Date = new Date()): string {
  const year = date.getFullYear();
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `${year}Q${quarter}`;
}

/**
 * Expected score for the first player vs the second player under ELO.
 * Standard 400-divisor formula.
 */
export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / ELO_DIVISOR));
}
