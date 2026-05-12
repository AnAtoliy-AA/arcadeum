import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** All fields are optional — partial update of a gem package. */
export class UpdateGemPackageDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  gems?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  bonusGems?: number;

  /** Price in US cents (e.g. 999 = $9.99). Range: $0.01–$1000. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100_000)
  priceUsdCents?: number;

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
