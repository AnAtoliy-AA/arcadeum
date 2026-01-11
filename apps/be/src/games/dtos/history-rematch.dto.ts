import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  GAME_ROOM_VISIBILITY_VALUES,
  type GameRoomVisibility,
} from '../schemas/game-room.schema';

export class HistoryRematchDto {
  @IsString()
  roomId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  participantIds?: string[];

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  gameId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(GAME_ROOM_VISIBILITY_VALUES)
  visibility?: GameRoomVisibility;

  @IsOptional()
  gameOptions?: Record<string, unknown>;
}
