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

export interface LegalMove {
  from: BoardPosition;
  to: BoardPosition;
  promotion: PieceType | null;
}

export interface ChessState extends BaseGameState {
  variant: ChessVariant;
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
  clocks: Record<PieceColor, PlayerClock> | null;
  positionHistory: string[];
  legalMovesForCurrentPlayer: LegalMove[];
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
