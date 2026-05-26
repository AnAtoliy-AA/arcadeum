import type { BaseGameWidgetProps } from '@/features/games/types/base';

export type TicTacToeGameProps = BaseGameWidgetProps;

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;

export const BOARD_SIZES = [3, 5, 7, 9] as const;
export type BoardSize = (typeof BOARD_SIZES)[number];

export const WIN_LENGTHS: Record<BoardSize, 3 | 4 | 5> = {
  3: 3,
  5: 4,
  7: 5,
  9: 5,
};

export const TIC_TAC_TOE_VARIANT_IDS = [
  'classic',
  'neon',
  'paper',
  'pixel',
  'chalkboard',
  'retro',
] as const;
export type TicTacToeVariant = (typeof TIC_TAC_TOE_VARIANT_IDS)[number];

export const GAME_PHASE = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
} as const;
export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export type CellValue = string | null;

export interface WinLineCell {
  row: number;
  col: number;
}

export interface TicTacToePlayer {
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

export interface TicTacToeOptions {
  variant: TicTacToeVariant;
  boardSize: BoardSize;
  teamMode: boolean;
}

export interface TicTacToeClientState {
  phase: GamePhase;
  options: TicTacToeOptions;
  board: CellValue[][];
  winLength: 3 | 4 | 5;
  playerOrder: string[];
  currentTurnIndex: number;
  players: TicTacToePlayer[];
  teams: TicTacToeTeam[];
  winLine: WinLineCell[] | null;
  winnerId: string | null;
  isDraw: boolean;
}
