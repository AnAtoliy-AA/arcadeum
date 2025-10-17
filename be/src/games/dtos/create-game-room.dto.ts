import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  GAME_ROOM_VISIBILITY_VALUES,
  type GameRoomVisibility,
} from '../schemas/game-room.schema';

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
  notes?: string;
}
