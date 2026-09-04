import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const SOLO_RESULT_VALUES = ['won', 'lost'] as const;
type SoloResultValue = (typeof SOLO_RESULT_VALUES)[number];

export class SyncSoloScoreRecordDto {
  @IsString()
  gameId!: string;

  @IsString()
  difficulty!: string;

  @IsNumber()
  score!: number;

  @IsNumber()
  moves!: number;

  @IsNumber()
  durationMs!: number;

  @IsIn(SOLO_RESULT_VALUES)
  result!: SoloResultValue;

  @IsString()
  sessionId!: string;

  @IsNumber()
  timestamp!: number;
}

export class SyncSoloScoresDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => SyncSoloScoreRecordDto)
  records!: SyncSoloScoreRecordDto[];
}
