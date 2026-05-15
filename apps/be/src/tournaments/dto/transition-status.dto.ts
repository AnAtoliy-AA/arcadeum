import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  TOURNAMENT_STATUSES,
  type TournamentStatus,
} from '../schemas/tournament.schema';

export class TransitionStatusDto {
  @IsIn(TOURNAMENT_STATUSES)
  to!: TournamentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  resultText?: string;
}
