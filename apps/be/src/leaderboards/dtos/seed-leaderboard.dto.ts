import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SeedLeaderboardDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2_000)
  rowsPerMode?: number;

  @IsOptional()
  @IsString()
  season?: string;
}
