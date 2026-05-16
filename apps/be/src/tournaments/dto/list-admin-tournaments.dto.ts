import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  TOURNAMENT_GAME_TYPES,
  TOURNAMENT_STATUSES,
  type TournamentGameType,
} from '../schemas/tournament.schema';

export const ADMIN_TOURNAMENT_STATUS_FILTER = [
  'all',
  ...TOURNAMENT_STATUSES,
] as const;
export type AdminTournamentStatusFilter =
  (typeof ADMIN_TOURNAMENT_STATUS_FILTER)[number];

export class ListAdminTournamentsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 25;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @IsOptional()
  @IsIn(ADMIN_TOURNAMENT_STATUS_FILTER)
  status?: AdminTournamentStatusFilter = 'all';

  @IsOptional()
  @IsIn(TOURNAMENT_GAME_TYPES)
  gameType?: TournamentGameType;
}
