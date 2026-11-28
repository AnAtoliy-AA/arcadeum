import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateWeeklyCupDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  prizePoolCoins?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  prizeDescription?: string;
}
