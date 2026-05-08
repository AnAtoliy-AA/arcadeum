import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
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

  @IsOptional()
  @IsString()
  @MaxLength(64)
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  scope?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  range?: string;
}
