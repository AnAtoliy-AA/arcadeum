import type { BaseGameWidgetProps } from '@/features/games/types/base';

export type TicTacToeGameProps = BaseGameWidgetProps;

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 5;

export const BOARD_SIZES = [3, 5, 7, 9, 'infinity'] as const;
export type BoardSize = (typeof BOARD_SIZES)[number];

export const WIN_LENGTHS: Record<BoardSize, 3 | 4 | 5> = {
  3: 3,
  5: 4,
  7: 5,
  9: 5,
  infinity: 5,
};

// Per-board-size player caps — must match the BE
// `MAX_PLAYERS_BY_BOARD_SIZE` in tic-tac-toe.constants.ts.
export const MAX_PLAYERS_BY_BOARD_SIZE: Record<BoardSize, number> = {
  3: 2,
  5: 3,
  7: 4,
  9: 5,
  infinity: 5,
};

export const INFINITY_MARGIN_OPTIONS = [1, 2, 3] as const;
export type InfinityMargin = (typeof INFINITY_MARGIN_OPTIONS)[number];

export const INFINITY_WIN_LENGTH_OPTIONS = [4, 5] as const;
export type InfinityWinLength = (typeof INFINITY_WIN_LENGTH_OPTIONS)[number];

export const TIC_TAC_TOE_THEME_IDS = [
  'cyberpunk',
  'underwater',
  'crime',
  'horror',
  'adventure',
  'high-altitude-hike',
  'galaxy',
  'fantasy',
  'western',
  'egypt',
  'steampunk',
  'zen',
] as const;
export type TicTacToeTheme = (typeof TIC_TAC_TOE_THEME_IDS)[number];

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
  theme: TicTacToeTheme;
  variant?: TicTacToeTheme;
  boardSize: BoardSize;
  teamMode: boolean;
  expansionMargin: InfinityMargin;
  infinityWinLength: InfinityWinLength;
}

export interface TicTacToeLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  scope?: 'all' | 'players' | 'private' | 'team';
  senderId?: string | null;
  senderName?: string | null;
  targetId?: string | null;
}

export interface TicTacToeClientState {
  phase: GamePhase;
  options: TicTacToeOptions;
  board: CellValue[][];
  winLength: 3 | 4 | 5;
  origin: { row: number; col: number };
  playerOrder: string[];
  currentTurnIndex: number;
  players: TicTacToePlayer[];
  teams: TicTacToeTeam[];
  winLine: WinLineCell[] | null;
  winnerId: string | null;
  isDraw: boolean;
  logs: TicTacToeLogEntry[];
}
