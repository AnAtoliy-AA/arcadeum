import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** UCI move such as e2e4 or e7e8q. */
export const UCI_MOVE_PATTERN = /^[a-h][1-8][a-h][1-8][qrbnQRBN]?$/;

export class SolvePuzzleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  puzzleId!: string;

  @IsArray()
  @ArrayMaxSize(64)
  @IsString({ each: true })
  @Matches(UCI_MOVE_PATTERN, { each: true })
  moves!: string[];

  @IsInt()
  @Min(0)
  @Max(86_400_000)
  timeMs!: number;
}
