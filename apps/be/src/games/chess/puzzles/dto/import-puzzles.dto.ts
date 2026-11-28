import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { UCI_MOVE_PATTERN } from './solve-puzzle.dto';

export class ImportPuzzleItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  puzzleId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fen!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(64)
  @Matches(UCI_MOVE_PATTERN, { each: true })
  moves!: string[];

  @IsNumber()
  @Min(100)
  @Max(4000)
  rating!: number;

  @IsOptional()
  @IsNumber()
  ratingDeviation?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  themes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  openingTags?: string[];
}

export class ImportPuzzlesDto {
  @IsArray()
  @ArrayMaxSize(5000)
  @ValidateNested({ each: true })
  @Type(() => ImportPuzzleItemDto)
  puzzles!: ImportPuzzleItemDto[];
}
