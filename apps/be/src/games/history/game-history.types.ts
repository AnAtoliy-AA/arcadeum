export type GameHistoryStatus =
  | 'active'
  | 'completed'
  | 'abandoned'
  | 'waiting';

export interface HistoryParticipantSummary {
  id: string;
  username: string;
  email: string | null;
  isHost: boolean;
}

export interface GameHistorySummary {
  id: string;
  roomId: string;
  gameId: string;
  gameName: string;
  roomName: string;
  startedAt: string;
  completedAt: string | null;
  lastActivityAt: string;
  status: GameHistoryStatus;
  participants: HistoryParticipantSummary[];
  hostId: string;
  result?: {
    winners: string[];
    finalState: Record<string, unknown>;
  };
  gameOptions?: Record<string, unknown>;
}

export interface GroupedHistorySummary {
  roomId: string;
  gameId: string;
  gameName: string;
  hostId: string;
  participants: HistoryParticipantSummary[];
  sessions: Array<{
    id: string;
    startedAt: string;
    completedAt: string | null;
    status: GameHistoryStatus;
    winners?: string[];
  }>;
  totalSessions: number;
  latestSessionAt: string;
}

export interface GameTypeStats {
  gameId: string;
  totalGames: number;
  wins: number;
  winRate: number;
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  byGameType: GameTypeStats[];
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
}
