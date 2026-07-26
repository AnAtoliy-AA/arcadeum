import {
  GAME_ROOM_STATUS_VALUES,
  type GameRoomStatus,
} from './schemas/game-room.schema';
import { GAME_CATALOG } from './games.catalog';

const VALID_GAME_IDS = new Set(GAME_CATALOG.map((g) => g.gameId));
const VALID_STATUSES = new Set<string>(GAME_ROOM_STATUS_VALUES);

export function validateGameId(gameId: string): void {
  if (!VALID_GAME_IDS.has(gameId)) {
    throw new Error(`Invalid gameId: ${gameId}`);
  }
}

export function isValidStatus(status: string): status is GameRoomStatus {
  return VALID_STATUSES.has(status);
}
