export type GameMode =
  | 'all'
  | 'critical_v1'
  | 'sea_battle_v1'
  | 'texas_holdem_v1'
  | 'glimworm_v1'
  | 'tic_tac_toe_v1'
  | 'cascade_v1'
  | 'chess_v1'
  | 'checkers_v1'
  | 'cat_dash_v1';

export type Region = 'na' | 'eu' | 'sa' | 'asia' | 'oceania' | 'africa' | 'me';

export type Tier =
  'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'mythic';

export type FormResult = 'W' | 'L' | 'D';

export type LeaderboardPlayer = {
  id: string;
  rank: number;
  prevRank?: number;
  name: string;
  avatarUrl?: string;
  countryCode?: string;
  /** Real region derived from the player's country. Undefined when unknown. */
  region?: Region;
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
  /** Prestige role (premium/vip/supporter/…) for the VIP avatar treatment. */
  role?: string | null;
  /** Cosmetic ids the player has equipped; resolved via the shop catalog. */
  equippedAvatarId?: string | null;
  equippedBadgeId?: string | null;
  equippedNameColorId?: string | null;
  equippedFrameId?: string | null;
  equippedAuraId?: string | null;
  equippedBannerId?: string | null;
  equippedGameSkinId?: string | null;
};

export type MythicPlayer = LeaderboardPlayer & {
  ratingDelta: number;
  streak: number;
};

export type CupSnapshot = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  prizePoolUSD: number;
  participantCount: number;
  qualified?: LeaderboardPlayer[];
};

export type RewardTierItem = {
  tier: Tier;
  rankFrom: number;
  rankTo: number;
  rewardLabel: string;
  iconKey?: string;
  icon?: string;
  color?: string;
};

export type RegionDistribution = Array<{
  region: Region;
  share: number;
  topPlayer?: { id: string; name: string };
}>;

export type ClimberFaller = {
  player: LeaderboardPlayer;
  delta: number;
  fromRank: number;
  toRank: number;
};

export type Squad = {
  id: string;
  name: string;
  tag: string;
  rating: number;
  memberCount: number;
  rank: number;
  isYou?: boolean;
};

export type TickerEvent = {
  who: string;
  what: string;
  color?: string;
};

export type PlayerProfile = {
  player: LeaderboardPlayer;
  modeRanks: Array<{
    mode: GameMode;
    rank: number;
    rating: number;
  }>;
  squad?: Squad;
  /** Total XP earned across all seasons. */
  xp: number;
  /** Equipped cosmetic ids from the shop; resolved via the catalog map. */
  equippedAvatarId?: string | null;
  equippedBadgeId?: string | null;
  equippedNameColorId?: string | null;
  equippedFrameId?: string | null;
  equippedAuraId?: string | null;
  equippedBannerId?: string | null;
  equippedGameSkinId?: string | null;
};

export type LeaderboardSnapshot = {
  capturedAt: string;
  mode: GameMode;
  /** Available modes returned by the server — render tabs from this list. */
  modes: GameMode[];
  page: number;
  mythic: MythicPlayer | null;
  podium: [LeaderboardPlayer, LeaderboardPlayer, LeaderboardPlayer] | null;
  rows: LeaderboardPlayer[];
  totalRows: number;
  cup: CupSnapshot | null;
  rewards: RewardTierItem[];
  regions: RegionDistribution;
  climbers: ClimberFaller[];
  fallers: ClimberFaller[];
  squads: Squad[];
  self: LeaderboardPlayer | null;
  tickerEvents: TickerEvent[];
  topRating: number;
};
