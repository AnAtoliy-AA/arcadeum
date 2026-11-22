import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateClanWarDto {
  @IsMongoId()
  @IsNotEmpty()
  targetClanId!: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  gameId?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(50)
  targetScore?: number;
}
