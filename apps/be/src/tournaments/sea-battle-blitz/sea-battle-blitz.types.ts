import type {
  PublicTournamentItem,
  TournamentBracketView,
} from '../interfaces/tournament.interface';

export interface SeaBattleBlitzCaptain {
  userId: string;
  displayName: string | null;
  seed: number;
  waitlist: boolean;
}

export interface SeaBattleBlitzCupResponse {
  tournament: PublicTournamentItem | null;
  bracket: TournamentBracketView | null;
  countdownSeconds: number;
  enabled: boolean;
  captains: SeaBattleBlitzCaptain[];
}

export interface SeaBattleBlitzCupConfig {
  enabled: boolean;
  prizePoolCoins: number;
  prizeDescription: string;
}
