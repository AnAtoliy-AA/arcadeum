import { IsIn, IsOptional } from 'class-validator';
import {
  TOURNAMENT_LOCALES,
  type TournamentLocale,
} from '../schemas/tournament.schema';

export class ListPublicTournamentsDto {
  @IsOptional()
  @IsIn(TOURNAMENT_LOCALES)
  locale?: TournamentLocale;
}
