import type { BaseGameWidgetProps } from '@/features/games/types/base';

export type ChessGameProps = BaseGameWidgetProps;

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export type File = (typeof FILES)[number];

export const RANKS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type Rank = (typeof RANKS)[number];

export const PIECE_TYPES = [
  'pawn',
  'knight',
  'bishop',
  'rook',
  'queen',
  'king',
] as const;
export type PieceType = (typeof PIECE_TYPES)[number];

export const PIECE_COLORS = ['white', 'black'] as const;
export type PieceColor = (typeof PIECE_COLORS)[number];

export const PIECE_SYMBOLS: Record<PieceType, Record<PieceColor, string>> = {
  pawn: { white: '♙', black: '♟' },
  knight: { white: '♘', black: '♞' },
  bishop: { white: '♗', black: '♝' },
  rook: { white: '♖', black: '♜' },
  queen: { white: '♕', black: '♛' },
  king: { white: '♔', black: '♚' },
};

export interface BoardPosition {
  rank: Rank;
  file: File;
}

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export type Board = (ChessPiece | null)[][];

export interface CastlingRights {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
}

export interface ChessMove {
  from: BoardPosition;
  to: BoardPosition;
  piece: ChessPiece;
  captured: ChessPiece | null;
  promotion: PieceType | null;
  isCastle: boolean;
  isEnPassant: boolean;
  notation: string;
}

export interface ChessPlayer {
  playerId: string;
  color: PieceColor;
  isBot: boolean;
}

export interface ChessOptions {
  variant: 'standard' | 'chess960';
  timeControl: TimeControl | null;
}

export type TimeControlType = 'bullet' | 'blitz' | 'rapid' | 'classical' | 'daily';
export type TimeIncrement = 0 | 1 | 3 | 5 | 10 | 15 | 30;

export interface TimeControl {
  type: TimeControlType;
  initialSeconds: number;
  incrementSeconds: TimeIncrement;
}

export interface PlayerClock {
  remainingSeconds: number;
  lastMoveTimestamp: number;
}

export const CHESS_PHASE = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
} as const;
export type ChessPhase = (typeof CHESS_PHASE)[keyof typeof CHESS_PHASE];

export interface ChessLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  scope?: 'all' | 'players' | 'private' | 'team';
  senderId?: string | null;
  senderName?: string | null;
  targetId?: string | null;
}

export interface LegalMove {
  from: BoardPosition;
  to: BoardPosition;
  promotion: PieceType | null;
}

export interface ChessClientState {
  phase: ChessPhase;
  variant: 'standard' | 'chess960';
  timeControl: TimeControl | null;
  board: Board;
  currentTurnColor: PieceColor;
  castlingRights: CastlingRights;
  enPassantTarget: BoardPosition | null;
  halfMoveClock: number;
  fullMoveNumber: number;
  moveHistory: ChessMove[];
  players: ChessPlayer[];
  winnerColor: PieceColor | null;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDrawByRepetition: boolean;
  isDrawByFiftyMoveRule: boolean;
  isInsufficientMaterial: boolean;
  isDrawByAgreement: boolean;
  drawOfferedBy: string | null;
  clocks: Record<PieceColor, PlayerClock> | null;
  positionHistory: string[];
  currentTurnIndex: number;
  logs: ChessLogEntry[];
  legalMovesForCurrentPlayer: LegalMove[];
}

export const PROMOTION_PIECES: PieceType[] = [
  'queen',
  'rook',
  'bishop',
  'knight',
];

export const TIME_CONTROLS: TimeControl[] = [
  { type: 'bullet', initialSeconds: 60, incrementSeconds: 0 },
  { type: 'bullet', initialSeconds: 60, incrementSeconds: 1 },
  { type: 'bullet', initialSeconds: 120, incrementSeconds: 1 },
  { type: 'blitz', initialSeconds: 180, incrementSeconds: 0 },
  { type: 'blitz', initialSeconds: 300, incrementSeconds: 0 },
  { type: 'blitz', initialSeconds: 300, incrementSeconds: 3 },
  { type: 'rapid', initialSeconds: 600, incrementSeconds: 0 },
  { type: 'rapid', initialSeconds: 900, incrementSeconds: 10 },
  { type: 'classical', initialSeconds: 1800, incrementSeconds: 0 },
];

export const CHESS_THEME_IDS = ['standard', 'chess960'] as const;
export type ChessTheme = (typeof CHESS_THEME_IDS)[number];
