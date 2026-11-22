import { IsIn, IsOptional } from 'class-validator';
import {
  TOURNAMENT_GAME_TYPES,
  TOURNAMENT_LOCALES,
  type TournamentGameType,
  type TournamentLocale,
} from '../schemas/tournament.schema';

export class ListPublicTournamentsDto {
  @IsOptional()
  @IsIn(TOURNAMENT_LOCALES)
  locale?: TournamentLocale;

  @IsOptional()
  @IsIn(TOURNAMENT_GAME_TYPES)
  gameType?: TournamentGameType;
}
