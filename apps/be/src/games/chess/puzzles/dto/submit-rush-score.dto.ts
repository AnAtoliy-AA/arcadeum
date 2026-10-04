import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class SubmitRushScoreDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['survival', 'timed'])
  mode!: 'survival' | 'timed';

  @IsNumber()
  @Min(0)
  @Max(1000)
  score!: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  bestStreak!: number;

  @IsNumber()
  @Min(0)
  @Max(86400)
  totalTimeSeconds!: number;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(4000)
  rating?: number;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
