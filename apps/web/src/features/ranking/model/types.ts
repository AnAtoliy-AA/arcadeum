export const RANKING_TIER_VALUES = [
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
  'master',
] as const;

export type RankingTier = (typeof RANKING_TIER_VALUES)[number];

/** Per-user rating change carried in `session.state.gameResult.ratingDeltas`. */
export interface RatingDelta {
  elo: number;
  delta: number;
  tier: RankingTier;
}

export interface RankingPlayer {
  rank: number;
  userId: string;
  username: string;
  elo: number;
  tier: RankingTier;
  wins: number;
  losses: number;
  draws: number;
  peakElo: number;
}

export interface RankingSnapshot {
  gameId: string;
  season: string;
  total: number;
  entries: RankingPlayer[];
}

export interface MyRanking {
  gameId: string;
  season: string;
  elo: number;
  tier: RankingTier;
  peakElo: number;
  wins: number;
  losses: number;
  draws: number;
  rankedGames: number;
  rank: number | null;
}
