/**
 * Shared types and constants for the games module
 * These types are used across multiple services and controllers
 */

import type {
  GameRoomSummary,
  GameRoomMemberSummary,
  LeaveGameRoomResult,
  DeleteGameRoomResult,
  ListRoomsFilters,
} from './rooms/game-rooms.types';

import type {
  GameSessionSummary,
  CreateSessionOptions,
  ExecuteActionOptions,
} from './sessions/game-sessions.service';

// Re-export types from services
export type {
  GameRoomSummary,
  GameRoomMemberSummary,
  LeaveGameRoomResult,
  DeleteGameRoomResult,
  ListRoomsFilters,
};

export type { GameSessionSummary, CreateSessionOptions, ExecuteActionOptions };

export type {
  GameHistorySummary,
  HistoryParticipantSummary,
  GroupedHistorySummary,
} from './history/game-history.types';

// StartGameSessionResult interface
export interface StartGameSessionResult {
  room: GameRoomSummary;
  session: GameSessionSummary;
}

// Backward compatibility type aliases
export type StartExplodingCatsSessionResult = StartGameSessionResult;

// Game room participation filters for the API
export const GAME_ROOM_PARTICIPATION_FILTERS = [
  'all',
  'hosting',
  'joined',
  'not_joined',
] as const;

export type GameRoomParticipationFilter =
  (typeof GAME_ROOM_PARTICIPATION_FILTERS)[number];

// User summary type
export interface UserSummary {
  id: string;
  displayName: string;
  username?: string | null;
  email?: string | null;
}
