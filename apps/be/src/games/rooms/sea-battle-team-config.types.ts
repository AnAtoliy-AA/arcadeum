export interface SeaBattleTeamConfigEntry {
  id: string;
  name: string;
  color: string;
  targetSize: number;
  playerIds: string[];
}

export interface SeaBattleGameOptions {
  teamMode?: boolean;
  hideShipsFromTeammates?: boolean;
  teams?: SeaBattleTeamConfigEntry[];
  [key: string]: unknown;
}

export const TEAM_DEFAULT_COLORS = ['#E11D48', '#2563EB', '#16A34A', '#D97706'];
