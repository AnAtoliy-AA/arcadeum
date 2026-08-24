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
