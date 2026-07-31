import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class TrackChallengeProgressDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9_-]+$/, { message: 'Invalid challengeId format' })
  challengeId!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Invalid date format' })
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
  @Matches(/^[a-z0-9_-]+$/, { message: 'Invalid challengeId format' })
  challengeId!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Invalid date format' })
  date!: string;
}
