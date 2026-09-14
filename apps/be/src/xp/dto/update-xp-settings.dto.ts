import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateXpSettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  winXp?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lossXp?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  drawXp?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  soloCoefficient?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  botCoefficient?: number;
}
