import { IsIn } from 'class-validator';
import {
  TOURNAMENT_BRACKET_FORMATS,
  type TournamentBracketFormat,
} from '../schemas/tournament.schema';

export class GenerateBracketDto {
  @IsIn(TOURNAMENT_BRACKET_FORMATS)
  format!: TournamentBracketFormat;
}
