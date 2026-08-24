export type EventStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface EventParticipant {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  gamesPlayed: number;
  wins: number;
  points: number;
  registeredAt: string;
}

export interface GameNightEvent {
  id: string;
  title: string;
  description: string;
  gameType: string;
  status: EventStatus;
  startTime: string;
  endTime: string;
  prizeBadge: string | null;
  participantCount: number;
  activeGamesCount: number;
  mvpUserId: string | null;
  mvpDisplayName: string | null;
  mvpPoints: number;
  createdAt: string;
}

export interface GameNightEventDetail extends GameNightEvent {
  participants: EventParticipant[];
  leaderboard: EventParticipant[];
}

export interface RecordMatchPayload {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  won: boolean;
  pointsEarned?: number;
}
