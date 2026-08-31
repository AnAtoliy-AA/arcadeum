export interface LivePopularGame {
  gameId: string;
  activePlayers: number;
  matchesCount: number;
  matchesWeekCount: number;
}

export interface LiveRoomItem {
  id: string;
  gameId: string;
  name: string;
  hostId: string;
  hostName: string;
  currentPlayers: number;
  maxPlayers: number;
  status: 'lobby' | 'in_progress';
  hasPassword?: boolean;
  visibility?: 'public' | 'unlisted' | 'private';
  createdAt: string;
}

export interface LiveActivityItem {
  id: string;
  type: 'victory' | 'streak' | 'room_created';
  gameId: string;
  username: string;
  detail?: string;
  timestamp: string;
}

export interface LiveStatsResponse {
  onlineUsers: number;
  totalUsers: number;
  totalMatches: number;
  totalSubscribers: number;
  platformSubscribers: Record<string, number>;
  activeGames: number;
  activeGamesByGame?: Record<string, number>;
  waitingRooms: number;
  waitingPlayers: number;
  waitingQueues?: Record<string, number>;
  matchesToday: number;
  popularGames: LivePopularGame[];
  openRooms: LiveRoomItem[];
  recentActivity: LiveActivityItem[];
}
