/**
 * Client-side mirror of the backend Sea Battle team-mode types.
 *
 * These types intentionally duplicate the backend shape (rather than importing
 * from the BE) so the web app can be built and tested in isolation. Keep this
 * file in sync with `apps/be/src/games/sea-battle/team-mode.types.ts`.
 */

export interface SeaBattleTeam {
  id: string;
  name: string;
  color: string;
  targetSize: number;
  playerIds: string[];
}

export interface SeaBattleGameOptions {
  teamMode?: boolean;
  hideShipsFromTeammates?: boolean;
  teams?: SeaBattleTeam[];
}

/** Default team colors picked from the design palette (Tailwind 600 family). */
export const TEAM_DEFAULT_COLORS: readonly string[] = [
  '#E11D48',
  '#2563EB',
  '#16A34A',
  '#D97706',
];

export const MAX_TEAMS = 4;
export const MIN_TEAMS = 2;
export const MIN_TEAM_SIZE = 2;
export const MAX_TOTAL_PLAYERS = 8;
