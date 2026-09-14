import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

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

  /**
   * IANA timezone identifier (e.g. "America/New_York", "Europe/London").
   * null resets to UTC. Validated loosely — the cron will skip invalid values.
   */
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z_]+\/[A-Za-z_]+([A-Za-z_]*\/[A-Za-z_]*)?$/)
  timezone?: string;
}
