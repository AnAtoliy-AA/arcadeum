import type {
  BaseGameState,
  GamePlayerState,
} from '../base/game-engine.interface';
import type { BoardSize, GamePhase, Variant } from './tic-tac-toe.constants';

export interface TicTacToeOptions {
  variant: Variant;
  boardSize: BoardSize;
  teamMode: boolean;
}

export type CellValue = string | null;

export interface TicTacToePlayer extends GamePlayerState {
  playerId: string;
  symbol: string;
  alive: boolean;
  teamId?: string;
}

export interface TicTacToeTeam {
  id: string;
  name: string;
  color: string;
  playerIds: string[];
  currentShooterIndex: number;
}

export interface WinLineCell {
  row: number;
  col: number;
}

export interface TicTacToeState extends BaseGameState {
  phase: GamePhase;
  options: TicTacToeOptions;
  board: CellValue[][];
  winLength: 3 | 4 | 5;
  /** Player ids when teamMode=false, team ids when teamMode=true. */
  playerOrder: string[];
  currentTurnIndex: number;
  players: TicTacToePlayer[];
  teams: TicTacToeTeam[];
  winLine: WinLineCell[] | null;
  /** Player id or team id depending on mode; null until game ends with a winner. */
  winnerId: string | null;
  isDraw: boolean;
}

export interface PlaceMarkPayload {
  row: number;
  col: number;
}

export interface InitializeConfig {
  options?: Partial<TicTacToeOptions>;
  teams?: Array<{
    id: string;
    name: string;
    color: string;
    playerIds: string[];
  }>;
}
