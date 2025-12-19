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
  status: 'active' | 'completed' | 'abandoned' | 'waiting';
  participants: HistoryParticipantSummary[];
  hostId: string;
  result?: {
    winners: string[];
    finalState: Record<string, unknown>;
  };
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
    status: 'active' | 'completed' | 'abandoned' | 'waiting';
    winners?: string[];
  }>;
  totalSessions: number;
  latestSessionAt: string;
}
