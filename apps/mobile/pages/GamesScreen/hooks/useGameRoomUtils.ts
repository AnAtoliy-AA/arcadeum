import { type GameRoomSummary, type GameSessionSummary } from '../api/gamesApi';

// ─── Types ───────────────────────────────────────────────────────────────────

export type GameIntegrationId = 'exploding_cats_v1' | 'texas_holdem_v1';

export interface RoomJoinedPayload {
  room?: GameRoomSummary;
  session?: GameSessionSummary | null;
}

export interface RoomUpdatePayload {
  room?: GameRoomSummary;
}

export interface RoomDeletedPayload {
  roomId?: string;
}

export interface SnapshotPayload {
  roomId?: string;
  session?: GameSessionSummary | null;
}

export interface SessionStartedPayload {
  room: GameRoomSummary;
  session: GameSessionSummary;
}

export interface RoomIdPayload {
  roomId?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const GAME_INTEGRATION_MAP: Record<string, GameIntegrationId> = {
  exploding_cats_v1: 'exploding_cats_v1',
  'exploding-kittens': 'exploding_cats_v1',
  texas_holdem_v1: 'texas_holdem_v1',
  'texas-holdem': 'texas_holdem_v1',
};

// ─── Utility Functions ───────────────────────────────────────────────────────

export function resolveParam(
  value: string | string[] | undefined,
): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeWsMessageCode(raw: unknown): number | undefined {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw;
  }

  if (typeof raw === 'string') {
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function shouldExposeRawWsMessage(message?: string): boolean {
  if (!message) {
    return false;
  }

  return /\s/.test(message);
}

export function resolveIntegrationId(
  sessionEngine?: string,
  roomGameId?: string,
  paramGameId?: string,
): GameIntegrationId | undefined {
  if (sessionEngine && GAME_INTEGRATION_MAP[sessionEngine]) {
    return GAME_INTEGRATION_MAP[sessionEngine];
  }
  if (roomGameId && GAME_INTEGRATION_MAP[roomGameId]) {
    return GAME_INTEGRATION_MAP[roomGameId];
  }
  if (paramGameId && GAME_INTEGRATION_MAP[paramGameId]) {
    return GAME_INTEGRATION_MAP[paramGameId];
  }
  return undefined;
}
