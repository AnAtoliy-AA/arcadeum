import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class CurrentGameDto {
  @IsString() @MaxLength(64) id!: string;
  @IsOptional() @IsString() @MaxLength(64) roomId?: string;
  @IsOptional() @IsString() @MaxLength(64) theme?: string;
  @IsOptional() @IsString() @MaxLength(40) startedAt?: string;
}

/** Status pushed by the director every ~10 s. Bounded so it cannot bloat. */
export class StreamStatusDto {
  @IsString() @MaxLength(32) state!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CurrentGameDto)
  currentGame?: CurrentGameDto | null;

  @IsNumber() @Min(0) @Max(1e9) uptimeSec!: number;
  @IsNumber() @Min(0) @Max(240) ffmpegFps!: number;
  @IsInt() @Min(0) @Max(1e9) ffmpegRestarts!: number;
  @IsInt() @Min(0) @Max(1e9) gamesPlayed!: number;
  @IsBoolean() dryRun!: boolean;

  @IsOptional() @IsString() @MaxLength(300) lastRestartReason?: string | null;
  @IsOptional() @IsString() @MaxLength(40) lastRestartAt?: string | null;

  @IsInt() @Min(0) @Max(1e9) appliedConfigVersion!: number;

  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(300, { each: true })
  recentErrors!: string[];
}
