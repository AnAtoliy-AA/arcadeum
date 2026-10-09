export interface Clan {
  id: string;
  name: string;
  tag: string;
  description: string;
  avatarUrl: string | null;
  leaderId: string;
  memberCount: number;
  visibility: string;
  inviteCode: string | null;
  totalWins: number;
  totalGames: number;
  createdAt: string;
}

export interface ClanMember {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  equippedAvatarId: string | null;
  role: string;
  wins: number;
  gamesPlayed: number;
  online: boolean;
  joinedAt: string;
}

export interface ClanLeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  tag: string;
  description: string;
  avatarUrl: string | null;
  memberCount: number;
  totalWins: number;
  totalGames: number;
  winRate: number;
}

export interface ClanLeaderboardResponse {
  entries: ClanLeaderboardEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface ClanMvpEntry {
  rank: number;
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  equippedAvatarId: string | null;
  role: string;
  wins: number;
  gamesPlayed: number;
  winRate: number;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  gameId: string;
  target: number;
  currentProgress: number;
  progressPercent: number;
  participantsCount: number;
  rewardTitle: string;
  rewardBadge: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
}

export interface ClanWarLogEntry {
  id: string;
  playerClanId: string;
  playerName: string;
  opponentClanId: string;
  opponentName: string;
  gameId: string;
  winnerClanId: string;
  timestamp: string;
}

export type ClanWarStatus = 'pending' | 'active' | 'completed' | 'declined';

export interface ClanWar {
  id: string;
  initiatorClanId: string;
  initiatorClanName: string;
  initiatorClanTag: string;
  initiatorScore: number;
  targetClanId: string;
  targetClanName: string;
  targetClanTag: string;
  targetClanScore: number;
  targetScore: number;
  gameId: string;
  status: ClanWarStatus;
  winnerClanId: string | null;
  expiresAt: string;
  createdAt: string;
  matchLogs: ClanWarLogEntry[];
}

export type ClanTab = 'overview' | 'leaderboard' | 'challenges' | 'wars';
export type ClanLeaderboardSort = 'wins' | 'members' | 'winRate';
