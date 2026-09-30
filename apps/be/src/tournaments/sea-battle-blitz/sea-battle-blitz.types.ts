import type {
  PublicTournamentItem,
  TournamentBracketView,
} from '../interfaces/tournament.interface';

export interface SeaBattleBlitzCupResponse {
  tournament: PublicTournamentItem | null;
  bracket: TournamentBracketView | null;
  countdownSeconds: number;
}
