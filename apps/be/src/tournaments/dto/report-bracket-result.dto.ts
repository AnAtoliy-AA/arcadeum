import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class ReportBracketResultDto {
  @IsInt()
  @Min(0)
  round!: number;

  @IsInt()
  @Min(0)
  matchIndex!: number;

  @IsString()
  @IsNotEmpty()
  winnerUserId!: string;
}
