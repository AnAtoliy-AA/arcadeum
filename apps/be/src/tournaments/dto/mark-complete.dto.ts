import { IsMongoId } from 'class-validator';

export class MarkTournamentCompleteDto {
  @IsMongoId()
  winnerUserId!: string;
}
