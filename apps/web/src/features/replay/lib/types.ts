export interface ReplayPlayer {
  id: string;
  displayName: string;
  role?: string;
}

export interface ReplayAction {
  action: string;
  userId: string;
  payload?: unknown;
  timestamp: string;
}

export interface ReplayResult {
  winnerIds: string[];
  isDraw: boolean;
}

export interface ReplaySummary {
  replayId: string;
  roomId: string;
  gameId: string;
  players: ReplayPlayer[];
  result?: ReplayResult;
  totalMoves: number;
  durationMs: number;
  createdAt: string;
}

export interface ReplayDetail extends ReplaySummary {
  sessionId: string;
  playerIds: string[];
  initialState: Record<string, unknown>;
  actions: ReplayAction[];
  gameOptions?: Record<string, unknown>;
}

export type PlaybackSpeed = 1 | 2 | 4;

export const PLAYBACK_SPEEDS: PlaybackSpeed[] = [1, 2, 4];

export const BASE_STEP_INTERVAL_MS = 1500;
