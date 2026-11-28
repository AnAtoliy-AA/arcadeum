import type {
  BaseGameState,
  GamePlayerState,
} from '../../base/game-engine.interface';
import type { ChessVariant, PieceColor, PieceType } from './chess.constants';
import type { AiDifficulty } from '../../lib/ai-difficulty';

export type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

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

/** Original back-rank files of the castling rooks (0 = a-file, 7 = h-file). */
export interface CastlingRookFiles {
  white: { kingSide: number; queenSide: number };
  black: { kingSide: number; queenSide: number };
}

/** Why a finished game ended. Optional for backward compatibility. */
export type ChessEndReason =
  | 'checkmate'
  | 'stalemate'
  | 'resignation'
  | 'timeout'
  | 'timeout_vs_insufficient'
  | 'repetition'
  | 'fifty_move'
  | 'insufficient_material'
  | 'agreement'
  | 'aborted'
  | 'variant_win';

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

export interface ChessPlayer extends GamePlayerState {
  playerId: string;
  color: PieceColor;
  isBot: boolean;
}

export interface ChessOptions {
  variant: ChessVariant;
  timeControl: TimeControl | null;
  botDifficulty?: AiDifficulty;
  botPersonality?: string;
}

export type TimeControlType =
  'bullet' | 'blitz' | 'rapid' | 'classical' | 'daily';
export type TimeIncrement = 0 | 1 | 2 | 3 | 5 | 10 | 15 | 30;

export interface TimeControl {
  type: TimeControlType;
  initialSeconds: number;
  incrementSeconds: TimeIncrement;
  daysPerMove?: number;
}

export interface PlayerClock {
  /** Whole seconds left (rounded up), kept for display compatibility. */
  remainingSeconds: number;
  lastMoveTimestamp: number;
  /** Authoritative time left in milliseconds (server clock). */
  remainingMs?: number;
  /** Remaining lag-compensation allowance in milliseconds. */
  lagQuotaMs?: number;
}

export interface LegalMove {
  from: BoardPosition;
  to: BoardPosition;
  promotion: PieceType | null;
}

export interface ChessState extends BaseGameState {
  variant: ChessVariant;
  gameCreatedAt: number;
  timeControl: TimeControl | null;
  botDifficulty?: AiDifficulty;
  botPersonality?: string;
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
  takebackOfferedBy: string | null;
  takebackMoveIndex: number | null;
  clocks: Record<PieceColor, PlayerClock> | null;
  positionHistory: string[];
  legalMovesForCurrentPlayer: LegalMove[];
  checkCount?: { white: number; black: number };
  /** Original castling rook files (needed for Chess960). */
  castlingRookFiles?: CastlingRookFiles;
  /** Set when the game ends; absent on in-progress and legacy games. */
  endReason?: ChessEndReason;
  /** Flag fell but the opponent had no mating material (FIDE 6.9). */
  isDrawByTimeout?: boolean;
  /** Game aborted before both sides moved: no result, no rating change. */
  isAborted?: boolean;
  capturedPieces?: { white: PieceType[]; black: PieceType[] };
}

export interface MovePayload {
  fromFile: File;
  fromRank: Rank;
  toFile: File;
  toRank: Rank;
  promotion?: PieceType;
}

export interface ChessEngineConfig {
  timeControl?: TimeControl;
  variant?: ChessVariant;
  botDifficulty?: AiDifficulty;
  botPersonality?: string;
  aiDifficulty?: AiDifficulty;
}
