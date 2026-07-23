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

const GAME_RESULT_VALUES = ['won', 'lost', 'draw'] as const;
type GameResultValue = (typeof GAME_RESULT_VALUES)[number];

export class SyncStatRecordDto {
  @IsString()
  gameId!: string;

  @IsIn(GAME_RESULT_VALUES)
  result!: GameResultValue;

  @IsNumber()
  timestamp!: number;

  @IsString()
  sessionId!: string;
}

export class SyncStatsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => SyncStatRecordDto)
  records!: SyncStatRecordDto[];
}
