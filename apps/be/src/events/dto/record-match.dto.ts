import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class RecordMatchDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsBoolean()
  won!: boolean;

  @IsOptional()
  @IsNumber()
  pointsEarned?: number;
}
