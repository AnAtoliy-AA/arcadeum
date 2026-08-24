export type SeasonStatus = 'active' | 'archived';

export type SeasonTheme =
  | 'ember'
  | 'tides'
  | 'frost'
  | 'bloom'
  | 'eclipse'
  | 'aurora'
  | 'dawn'
  | 'dusk';

export type SeasonRewardKind = 'badge' | 'boardSkin' | 'pieceDesign';

export interface SeasonRewardTier {
  rankFrom: number;
  rankTo: number;
  rewardId: string;
  kind: SeasonRewardKind;
  icon: string;
  color: string;
}

export interface SeasonView {
  id: string;
  number: number;
  theme: SeasonTheme;
  status: SeasonStatus;
  startsAt: string;
  endsAt: string;
  rewardTiers: SeasonRewardTier[];
}

export interface SeasonChampion {
  gameId: string;
  userId: string;
  username: string | null;
  elo: number;
}

export interface SeasonDetailView extends SeasonView {
  archivedAt: string | null;
  champions: SeasonChampion[];
}

export interface SeasonStandingRow {
  rank: number;
  userId: string;
  username: string;
  elo: number;
  wins: number;
  rankedGames: number;
}

export interface SeasonBoardSnapshot {
  seasonId: string;
  gameId: string | null;
  total: number;
  entries: SeasonStandingRow[];
}
