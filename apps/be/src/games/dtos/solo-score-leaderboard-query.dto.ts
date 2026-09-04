import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

const SOLO_SORT_FIELDS = ['score', 'durationMs'] as const;
const SOLO_SORT_ORDERS = ['asc', 'desc'] as const;

export class SoloScoreLeaderboardQueryDto {
  @IsString()
  gameId!: string;

  @IsString()
  difficulty!: string;

  @IsOptional()
  @IsIn(SOLO_SORT_FIELDS)
  sortBy?: 'score' | 'durationMs';

  @IsOptional()
  @IsIn(SOLO_SORT_ORDERS)
  order?: 'asc' | 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;
}
