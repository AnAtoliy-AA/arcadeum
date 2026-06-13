import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  daily_reward_ready?: boolean;

  @IsOptional()
  @IsBoolean()
  tournament_starting_soon?: boolean;

  @IsOptional()
  @IsBoolean()
  tournament_registration_opened?: boolean;

  @IsOptional()
  @IsBoolean()
  announcement_new?: boolean;
}
