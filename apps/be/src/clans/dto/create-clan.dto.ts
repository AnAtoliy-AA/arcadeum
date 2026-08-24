import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import type { ClanVisibility } from '../schemas/clan.schema';

export class CreateClanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(6)
  tag!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(['public', 'private'] as const)
  visibility?: ClanVisibility;
}
