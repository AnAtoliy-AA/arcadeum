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
  hostName: string;
  currentPlayers: number;
  maxPlayers: number;
  status: 'lobby' | 'in_progress';
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
  activeGames: number;
  waitingRooms: number;
  matchesToday: number;
  popularGames: LivePopularGame[];
  openRooms: LiveRoomItem[];
  recentActivity: LiveActivityItem[];
}
