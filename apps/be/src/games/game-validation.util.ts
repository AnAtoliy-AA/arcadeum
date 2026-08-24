import { BadRequestException } from '@nestjs/common';
import {
  GAME_ROOM_STATUS_VALUES,
  type GameRoomStatus,
} from './schemas/game-room.schema';
import { GAME_CATALOG } from './games.catalog';

const VALID_GAME_IDS = new Set(GAME_CATALOG.map((g) => g.gameId));
const VALID_STATUSES = new Set<string>(GAME_ROOM_STATUS_VALUES);

export function validateGameId(gameId: string): void {
  if (!VALID_GAME_IDS.has(gameId)) {
    // Client-supplied input (query params, DTOs, replay paths) — respond with
    // a clean 400 instead of an unhandled 500 that spams the error log.
    throw new BadRequestException(`Invalid gameId: ${gameId}`);
  }
}

export function isValidStatus(status: string): status is GameRoomStatus {
  return VALID_STATUSES.has(status);
}
