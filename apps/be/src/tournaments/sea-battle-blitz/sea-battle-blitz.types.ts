import type {
  PublicTournamentItem,
  TournamentBracketView,
} from '../interfaces/tournament.interface';

export interface SeaBattleBlitzCupResponse {
  tournament: PublicTournamentItem | null;
  bracket: TournamentBracketView | null;
  countdownSeconds: number;
  enabled: boolean;
}

export interface SeaBattleBlitzCupConfig {
  enabled: boolean;
  prizePoolCoins: number;
  prizeDescription: string;
}
