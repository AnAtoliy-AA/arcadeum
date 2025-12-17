// History Types

export interface HistoryParticipant {
  id: string;
  username: string;
  email: string | null;
  isHost: boolean;
}

export interface HistorySummary {
  roomId: string;
  sessionId: string | null;
  gameId: string;
  roomName: string;
  status: "lobby" | "in_progress" | "completed" | "waiting" | "active";
  startedAt: string | null;
  completedAt: string | null;
  lastActivityAt: string;
  host: HistoryParticipant;
  participants: HistoryParticipant[];
}

export interface HistoryLogEntry {
  id: string;
  type: "system" | "action" | "message";
  message: string;
  createdAt: string;
  scope?: "all" | "players";
  sender?: HistoryParticipant;
}

export interface HistoryDetail {
  summary: HistorySummary;
  logs: HistoryLogEntry[];
}
