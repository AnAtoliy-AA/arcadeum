import { type GameRoomSummary, type GameSessionSummary } from '../api/gamesApi';

// ─── Types ───────────────────────────────────────────────────────────────────

export type GameIntegrationId = 'exploding_kittens_v1' | 'texas_holdem_v1';

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

const VALID_INTEGRATION_IDS: readonly GameIntegrationId[] = [
  'exploding_kittens_v1',
  'texas_holdem_v1',
];

function isValidIntegrationId(id: string): id is GameIntegrationId {
  return VALID_INTEGRATION_IDS.includes(id as GameIntegrationId);
}

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
  if (sessionEngine && isValidIntegrationId(sessionEngine)) {
    return sessionEngine;
  }
  if (roomGameId && isValidIntegrationId(roomGameId)) {
    return roomGameId;
  }
  if (paramGameId && isValidIntegrationId(paramGameId)) {
    return paramGameId;
  }
  return undefined;
}

