import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  GAME_ROOM_VISIBILITY_VALUES,
  type GameRoomVisibility,
} from '../schemas/game-room.schema';
import { sanitizeNotes } from '../utils/sanitize-notes';

export class CreateGameRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  gameId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsEnum(GAME_ROOM_VISIBILITY_VALUES)
  visibility!: GameRoomVisibility;

  @IsOptional()
  @IsInt()
  @Min(2)
  maxPlayers?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? sanitizeNotes(value) : value,
  )
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  password?: string;

  @IsOptional()
  @IsObject()
  gameOptions?: Record<string, unknown>;
}
