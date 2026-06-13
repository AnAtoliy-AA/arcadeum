import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TrackChallengeProgressDto {
  @IsString()
  @IsNotEmpty()
  challengeId!: string;

  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsOptional()
  gameId?: string;

  @IsString()
  @IsOptional()
  action?: string;
}

export class ClaimChallengeRewardDto {
  @IsString()
  @IsNotEmpty()
  challengeId!: string;

  @IsString()
  @IsNotEmpty()
  date!: string;
}
