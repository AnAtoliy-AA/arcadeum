import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateCustomPuzzleDto {
  @IsString()
  @IsNotEmpty()
  fen!: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  moves!: string[];

  @IsOptional()
  @IsNumber()
  @Min(400)
  @Max(3500)
  rating?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  themes?: string[];

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
