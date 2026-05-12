import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  GAME_ROOM_VISIBILITY_VALUES,
  type GameRoomVisibility,
} from '../schemas/game-room.schema';

export class HistoryRematchDto {
  // Populated by the controller from the :roomId path param. Optional in the
  // body so the validator doesn't reject the request when the client only
  // supplies participantIds / gameOptions / message.
  @IsOptional()
  @IsString()
  roomId?: string;

  // Bots-only rematch is allowed → empty array means "just me + bots, fill
  // the room from the lobby".
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
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
