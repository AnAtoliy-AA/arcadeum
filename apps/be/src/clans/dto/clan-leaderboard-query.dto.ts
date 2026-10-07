import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export const CLAN_LEADERBOARD_SORT_FIELDS = [
  'wins',
  'members',
  'winRate',
] as const;
export type ClanLeaderboardSortField =
  (typeof CLAN_LEADERBOARD_SORT_FIELDS)[number];

export class ClanLeaderboardQueryDto {
  @IsOptional()
  @IsIn(CLAN_LEADERBOARD_SORT_FIELDS)
  sortBy?: ClanLeaderboardSortField = 'wins';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
