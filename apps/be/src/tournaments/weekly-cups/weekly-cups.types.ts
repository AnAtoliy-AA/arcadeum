import type {
  PublicTournamentItem,
  TournamentBracketView,
} from '../interfaces/tournament.interface';

export interface WeeklyCupCaptain {
  userId: string;
  displayName: string | null;
  seed: number;
  waitlist: boolean;
}

export interface WeeklyCupResponse {
  tournament: PublicTournamentItem | null;
  bracket: TournamentBracketView | null;
  countdownSeconds: number;
  enabled: boolean;
  captains: WeeklyCupCaptain[];
}

export interface WeeklyCupConfig {
  enabled: boolean;
  prizePoolCoins: number;
  prizeDescription: string;
}

export interface WeeklyCupConfigUpdate {
  enabled?: boolean;
  prizePoolCoins?: number;
  prizeDescription?: string;
}
