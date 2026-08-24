import { ConfigService } from '@nestjs/config';
import type { SeasonRewardTier, SeasonTheme } from './schemas/season.schema';
import type { SeasonRewardKind } from './schemas/season.schema';

/** The platform's first season: 2026 Q1. */
export const SEASON_EPOCH_YEAR = 2026;

/**
 * Soft reset tuning. At rollover each player's new-season seed rating is
 * pulled toward the anchor: `seed = anchor + (prior - anchor) * factor`.
 * Roadmap default: pull toward 1500 with a 50% factor.
 */
export const SEASON_RESET_ANCHOR_DEFAULT = 1500;
export const SEASON_RESET_FACTOR_DEFAULT = 0.5;

export function seasonResetAnchor(config?: ConfigService): number {
  const raw = config?.get<string | number>('SEASON_RESET_ANCHOR');
  const value = typeof raw === 'string' ? Number(raw) : raw;
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : SEASON_RESET_ANCHOR_DEFAULT;
}

export function seasonResetFactor(config?: ConfigService): number {
  const raw = config?.get<string | number>('SEASON_RESET_FACTOR');
  const value = typeof raw === 'string' ? Number(raw) : raw;
  return typeof value === 'number' &&
    Number.isFinite(value) &&
    value > 0 &&
    value <= 1
    ? value
    : SEASON_RESET_FACTOR_DEFAULT;
}

/** Pull a prior rating toward the season anchor. Pure so it is unit-testable. */
export function softResetRating(
  priorRating: number,
  anchor: number = SEASON_RESET_ANCHOR_DEFAULT,
  factor: number = SEASON_RESET_FACTOR_DEFAULT,
): number {
  return Math.round(anchor + (priorRating - anchor) * factor);
}

/** Quarter stamp, e.g. `2026Q3`. Mirrors `currentSeason()` in ranking.constants. */
export function seasonIdFor(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
  return `${year}Q${quarter}`;
}

export function seasonNumberFor(seasonId: string): number {
  const [yearPart, quarterPart] = seasonId.split('Q');
  const year = Number(yearPart);
  const quarter = Number(quarterPart);
  if (!Number.isFinite(year) || !Number.isFinite(quarter)) return 1;
  return Math.max(1, (year - SEASON_EPOCH_YEAR) * 4 + quarter);
}

export function seasonStartFor(seasonId: string): Date {
  const [yearPart, quarterPart] = seasonId.split('Q');
  return new Date(Date.UTC(Number(yearPart), (Number(quarterPart) - 1) * 3, 1));
}

/** Exclusive end of the quarter. */
export function seasonEndFor(seasonId: string): Date {
  const [yearPart, quarterPart] = seasonId.split('Q');
  return new Date(Date.UTC(Number(yearPart), Number(quarterPart) * 3, 1));
}

/** Deterministic theme per quarter so every deployment agrees on identity. */
const THEME_CYCLE: SeasonTheme[] = [
  'ember',
  'tides',
  'bloom',
  'aurora',
  'frost',
  'eclipse',
  'dawn',
  'dusk',
];

export function themeForSeason(seasonId: string): SeasonTheme {
  const index = seasonNumberFor(seasonId) % THEME_CYCLE.length;
  return THEME_CYCLE[index];
}

const REWARD_KIND_BY_RANK: SeasonRewardKind[] = [
  'badge',
  'boardSkin',
  'pieceDesign',
];

/** Default cosmetic reward catalog copied onto every new season. */
export function defaultRewardTiers(): SeasonRewardTier[] {
  return (
    [
      { rankFrom: 1, rankTo: 1, icon: '♛', color: '#ec4899' },
      { rankFrom: 2, rankTo: 10, icon: '◆', color: '#22d3ee' },
      { rankFrom: 11, rankTo: 50, icon: '◇', color: '#a78bfa' },
      { rankFrom: 51, rankTo: 200, icon: '★', color: '#facc15' },
      { rankFrom: 201, rankTo: 500, icon: '✦', color: '#94a3b8' },
    ] as const
  ).map((tier, i) => ({
    ...tier,
    rewardId: `season_${tier.rankFrom === tier.rankTo ? 'champion' : `top${tier.rankTo}`}`,
    kind: REWARD_KIND_BY_RANK[i % REWARD_KIND_BY_RANK.length],
  }));
}
