import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ClaimAchievementDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9_]+$/, { message: 'Invalid achievementId format' })
  achievementId: string;
}
