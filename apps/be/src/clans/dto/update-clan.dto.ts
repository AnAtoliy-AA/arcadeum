import { IsString, IsOptional, MaxLength, IsEnum } from 'class-validator';
import type { ClanVisibility } from '../schemas/clan.schema';

export class UpdateClanDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(6)
  tag?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsEnum(['public', 'private'] as const)
  visibility?: ClanVisibility;
}
