import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import type { RankingTier } from '../ranking.constants';

/** Per-player rating change returned after a ranked match. */
export interface RankingDelta {
  elo: number;
  /** Signed change vs the rating before the match. */
  delta: number;
  tier: RankingTier;
}

export interface RankingPlayerDto {
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

export interface RankingSnapshotDto {
  gameId: string;
  season: string;
  total: number;
  entries: RankingPlayerDto[];
}

export interface MyRankingDto {
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

export class GetRankingsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10_000)
  offset = 0;
}
