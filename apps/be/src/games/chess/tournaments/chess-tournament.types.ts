export interface ChessTournamentConfig {
  format: 'arena' | 'swiss';
  durationMinutes?: number;
  roundCount?: number;
  timeControl?: string;
  entryFeeCoins?: number;
  prizePoolCoins?: number;
  maxPlayers?: number;
  content: {
    en: { name: string; description?: string };
    ru?: { name: string; description?: string };
    es?: { name: string; description?: string };
    fr?: { name: string; description?: string };
    by?: { name: string; description?: string };
  };
}

export interface ChessTournamentStanding {
  userId: string;
  displayName: string | null;
  points: number;
  streak: number;
  wins: number;
  draws: number;
  losses: number;
  tiebreak?: number;
}

export interface ChessTournamentPairing {
  round: number;
  matchIndex: number;
  playerA: string;
  playerB: string;
  gameId?: string;
  result?: 'white' | 'black' | 'draw';
}

export interface ChessTournamentResult {
  tournamentId: string;
  gameId: string;
  winnerUserId: string | null;
  loserUserId: string | null;
  isDraw: boolean;
}

export type ChessTimeControl =
  | 'blitz_3_0'
  | 'blitz_3_2'
  | 'blitz_5_0'
  | 'blitz_5_3'
  | 'rapid_10_0'
  | 'rapid_10_5'
  | 'rapid_15_10'
  | 'classical_30_0';
