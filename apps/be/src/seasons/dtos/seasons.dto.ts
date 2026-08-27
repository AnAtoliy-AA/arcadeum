import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type {
  SeasonRewardKind,
  SeasonStatus,
  SeasonTheme,
} from '../schemas/season.schema';

export class ListSeasonsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 10;
}

export class SeasonBoardQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  gameId?: string;

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

export interface SeasonRewardTierView {
  rankFrom: number;
  rankTo: number;
  rewardId: string;
  kind: SeasonRewardKind;
  icon: string;
  color: string;
}

export interface SeasonView {
  id: string;
  number: number;
  theme: SeasonTheme;
  status: SeasonStatus;
  startsAt: string;
  endsAt: string;
  rewardTiers: SeasonRewardTierView[];
}

export interface SeasonChampionView {
  gameId: string;
  userId: string;
  username: string | null;
  elo: number;
}

export interface SeasonDetailView extends SeasonView {
  champions: SeasonChampionView[];
  archivedAt: string | null;
}

export interface SeasonStandingRow {
  rank: number;
  userId: string;
  username: string;
  elo: number;
  wins: number;
  rankedGames: number;
}

export interface SeasonBoardSnapshotDto {
  seasonId: string;
  gameId: string | null;
  total: number;
  entries: SeasonStandingRow[];
}
