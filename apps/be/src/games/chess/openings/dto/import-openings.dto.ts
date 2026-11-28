import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ImportOpeningItemDto {
  @IsArray()
  @ArrayMaxSize(60)
  @IsString({ each: true })
  @MaxLength(10, { each: true })
  moves!: string[];

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fen!: string;

  @IsOptional() @IsNumber() @Min(0) white?: number;
  @IsOptional() @IsNumber() @Min(0) draws?: number;
  @IsOptional() @IsNumber() @Min(0) black?: number;
  @IsOptional() @IsNumber() @Min(0) totalGames?: number;
  @IsOptional() @IsNumber() @Min(0) avgRating?: number;
  @IsOptional() @IsString() @MaxLength(200) opening?: string;
  @IsOptional() @IsString() @MaxLength(200) openingFamily?: string;
  @IsOptional() @IsString() @MaxLength(10) eco?: string;
}

export class ImportOpeningsDto {
  @IsArray()
  @ArrayMaxSize(10_000)
  @ValidateNested({ each: true })
  @Type(() => ImportOpeningItemDto)
  openings!: ImportOpeningItemDto[];
}

export class ClassifyOpeningDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(60)
  @IsString({ each: true })
  @MaxLength(10, { each: true })
  moves!: string[];
}
