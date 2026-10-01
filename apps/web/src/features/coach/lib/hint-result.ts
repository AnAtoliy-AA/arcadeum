import {
  FILES,
  PIECE_COLORS,
  PIECE_TYPES,
  RANKS,
  type BoardPosition,
  type ChessPiece,
  type File,
  type PieceColor,
  type PieceType,
  type Rank,
} from '@/widgets/BoardGames/ChessGame/types';
import type { ChessHint } from '@/features/coach/lib/hint-generator';

export interface ServerHintMove {
  from?: { file?: unknown; rank?: unknown } | null;
  to?: { file?: unknown; rank?: unknown } | null;
  piece?: { type?: unknown; color?: unknown } | null;
  captured?: { type?: unknown; color?: unknown } | null;
  promotion?: unknown;
  isCastle?: unknown;
}

export interface CheckersHintStep {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  capturedRow?: number;
  capturedCol?: number;
}

export interface CheckersHint {
  gameType?: 'checkers';
  from: { row: number; col: number };
  to: { row: number; col: number };
  steps: CheckersHintStep[];
}

export interface BackgammonHint {
  gameType?: 'backgammon';
  from: number | 'bar';
  to: number | 'off';
}

export interface ServerCheckersHintMove {
  gameType?: 'checkers';
  from?: { row?: unknown; col?: unknown } | null;
  to?: { row?: unknown; col?: unknown } | null;
  steps?: Array<{
    fromRow?: unknown;
    fromCol?: unknown;
    toRow?: unknown;
    toCol?: unknown;
    capturedRow?: unknown;
    capturedCol?: unknown;
  }> | null;
}

export interface ServerBackgammonHintMove {
  gameType?: 'backgammon';
  from?: unknown;
  to?: unknown;
}

export interface ServerHintResult {
  ok?: boolean;
  gameType?: 'chess' | 'checkers' | 'backgammon';
  move?:
    ServerHintMove | ServerCheckersHintMove | ServerBackgammonHintMove | null;
}

function isFile(value: unknown): value is File {
  return (
    typeof value === 'string' && (FILES as readonly string[]).includes(value)
  );
}

function isRank(value: unknown): value is Rank {
  return (
    typeof value === 'number' && (RANKS as readonly number[]).includes(value)
  );
}

function isPieceType(value: unknown): value is PieceType {
  return (
    typeof value === 'string' &&
    (PIECE_TYPES as readonly string[]).includes(value)
  );
}

function isPieceColor(value: unknown): value is PieceColor {
  return (
    typeof value === 'string' &&
    (PIECE_COLORS as readonly string[]).includes(value)
  );
}

function parsePosition(pos: ServerHintMove['from']): BoardPosition | null {
  if (!pos || !isFile(pos.file) || !isRank(pos.rank)) return null;
  return { file: pos.file, rank: pos.rank };
}

function parsePiece(piece: ServerHintMove['piece']): ChessPiece | null {
  if (!piece || !isPieceType(piece.type) || !isPieceColor(piece.color)) {
    return null;
  }
  return { type: piece.type, color: piece.color };
}

export function mapServerHint(move: unknown): ChessHint | null {
  if (!move || typeof move !== 'object') return null;
  const m = move as Record<string, unknown>;
  const from = parsePosition(m.from as ServerHintMove['from']);
  const to = parsePosition(m.to as ServerHintMove['to']);
  const piece = parsePiece(m.piece as ServerHintMove['piece']);
  if (!from || !to || !piece) return null;

  const captured = parsePiece(m.captured as ServerHintMove['captured']);
  const rawPromotion = m.promotion;
  const promotion = isPieceType(rawPromotion) ? rawPromotion : null;

  const fromCol = FILES.indexOf(from.file);
  const toCol = FILES.indexOf(to.file);
  const isCastle =
    piece.type === 'king' && Math.abs(toCol - fromCol) === 2
      ? toCol === 6
        ? 'king'
        : 'queen'
      : null;

  return { from, to, piece, captured, promotion, isCastle, score: 0 };
}

export function mapServerCheckersHint(move: unknown): CheckersHint | null {
  if (!move || typeof move !== 'object') return null;
  const m = move as Record<string, unknown>;
  const from = m.from as Record<string, unknown> | undefined;
  const to = m.to as Record<string, unknown> | undefined;
  const steps = m.steps as Array<Record<string, unknown>> | undefined;
  if (!from || !to || !Array.isArray(steps) || steps.length === 0) return null;
  if (
    typeof from.row !== 'number' ||
    typeof from.col !== 'number' ||
    typeof to.row !== 'number' ||
    typeof to.col !== 'number'
  ) {
    return null;
  }
  const parsedSteps: CheckersHintStep[] = [];
  for (const step of steps) {
    if (
      typeof step.fromRow !== 'number' ||
      typeof step.fromCol !== 'number' ||
      typeof step.toRow !== 'number' ||
      typeof step.toCol !== 'number'
    ) {
      return null;
    }
    parsedSteps.push({
      fromRow: step.fromRow,
      fromCol: step.fromCol,
      toRow: step.toRow,
      toCol: step.toCol,
      capturedRow:
        typeof step.capturedRow === 'number' ? step.capturedRow : undefined,
      capturedCol:
        typeof step.capturedCol === 'number' ? step.capturedCol : undefined,
    });
  }
  return {
    gameType: 'checkers',
    from: { row: from.row, col: from.col },
    to: { row: to.row, col: to.col },
    steps: parsedSteps,
  };
}

export function mapServerBackgammonHint(move: unknown): BackgammonHint | null {
  if (!move || typeof move !== 'object') return null;
  const m = move as Record<string, unknown>;
  const from = m.from;
  const to = m.to;
  const validFrom =
    from === 'bar' || (typeof from === 'number' && Number.isInteger(from));
  const validTo =
    to === 'off' || (typeof to === 'number' && Number.isInteger(to));
  if (!validFrom || !validTo) return null;
  return {
    gameType: 'backgammon',
    from: from as number | 'bar',
    to: to as number | 'off',
  };
}
