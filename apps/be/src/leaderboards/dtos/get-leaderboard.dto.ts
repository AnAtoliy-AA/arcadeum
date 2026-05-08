import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  GAME_MODE_VALUES,
  type GameMode,
} from '../schemas/leaderboard-entry.schema';

export class GetLeaderboardDto {
  @IsOptional()
  @IsEnum(GAME_MODE_VALUES)
  mode?: GameMode;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
