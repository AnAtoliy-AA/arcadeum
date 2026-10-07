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

export type ClanTab = 'overview' | 'leaderboard' | 'challenges';
export type ClanLeaderboardSort = 'wins' | 'members' | 'winRate';
