import type {
  FormResult,
  GameMode,
  Region,
  Tier,
} from '../schemas/leaderboard-entry.schema';

export type LeaderboardPlayerDto = {
  id: string;
  rank: number;
  prevRank?: number;
  name: string;
  countryCode?: string;
  region: Region;
  tier: Tier;
  rating: number;
  elo?: number;
  wins: number;
  losses: number;
  draws: number;
  winrate: number;
  recentForm: FormResult[];
  streak?: number;
  isOnline?: boolean;
  isFriend?: boolean;
  isInMatch?: boolean;
  gameTags?: string[];
};

export type MythicPlayerDto = LeaderboardPlayerDto & {
  ratingDelta: number;
  streak: number;
};

export type CupSnapshotDto = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  prizePoolUSD: number;
  participantCount: number;
  qualified?: LeaderboardPlayerDto[];
};

export type RewardTierItemDto = {
  tier: Tier;
  rankFrom: number;
  rankTo: number;
  rewardLabel: string;
  iconKey?: string;
  icon?: string;
  color?: string;
};

export type RegionDistributionDto = Array<{
  region: Region;
  share: number;
}>;

export type ClimberFallerDto = {
  player: LeaderboardPlayerDto;
  delta: number;
  fromRank: number;
  toRank: number;
};

export type SquadDto = {
  id: string;
  name: string;
  tag: string;
  rating: number;
  memberCount: number;
  rank: number;
  isYou?: boolean;
};

export type TickerEventDto = {
  who: string;
  what: string;
  color?: string;
};

export type PlayerProfileDto = {
  player: LeaderboardPlayerDto;
  modeRanks: Array<{
    mode: GameMode;
    rank: number;
    rating: number;
  }>;
  squad?: SquadDto;
};

export type LeaderboardSnapshotDto = {
  capturedAt: string;
  mode: GameMode;
  page: number;
  mythic: MythicPlayerDto | null;
  podium:
    | [LeaderboardPlayerDto, LeaderboardPlayerDto, LeaderboardPlayerDto]
    | null;
  rows: LeaderboardPlayerDto[];
  totalRows: number;
  cup: CupSnapshotDto | null;
  rewards: RewardTierItemDto[];
  regions: RegionDistributionDto;
  climbers: ClimberFallerDto[];
  fallers: ClimberFallerDto[];
  squads: SquadDto[];
  self: LeaderboardPlayerDto | null;
  tickerEvents: TickerEventDto[];
  topRating: number;
};
