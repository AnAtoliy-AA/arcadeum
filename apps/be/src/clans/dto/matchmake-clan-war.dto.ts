import { IsOptional, IsString, MaxLength } from 'class-validator';

export class MatchmakeClanWarDto {
  @IsString()
  @IsOptional()
  @MaxLength(30)
  gameId?: string;
}
