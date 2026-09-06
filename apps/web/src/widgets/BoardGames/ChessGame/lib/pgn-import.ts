import type { File, Rank, MovePayload } from '../types';
import { parseFen, INITIAL_BOARD_FEN } from '@arcadeum/games-core/games/chess/chess.board';
import { getLegalMoves } from '@arcadeum/games-core/games/chess/chess.move-generator';
import type { ChessState, ChessPiece, Board } from '../types';
import { FILES } from '../types';

interface PgnHeaders {
  Event?: string;
  Site?: string;
  Date?: string;
  Round?: string;
  White?: string;
  Black?: string;
  Result?: string;
  Variant?: string;
  FEN?: string;
}

interface PgnParseResult {
  headers: PgnHeaders;
  moves: MovePayload[];
  fen: string;
  variant: 'standard' | 'chess960';
}

function stripComments(pgn: string): string {
  return pgn.replace(/\{[^}]*\}/g, '').replace(/;[^\n]*/g, '');
}

function parseHeaders(pgn: string): PgnHeaders {
  const headers: PgnHeaders = {};
  const headerRegex = /\[(\w+)\s+"([^"]*)"\]/g;
  let match = headerRegex.exec(pgn);
  while (match) {
    headers[match[1] as keyof PgnHeaders] = match[2];
    match = headerRegex.exec(pgn);
  }
  return headers;
}

function extractMoveText(pgn: string): string {
  let text = pgn.replace(/\[(\w+)\s+"[^"]*"\]/g, '');
  text = stripComments(text);
  text = text.replace(/\d+\.\.\./g, '');
  text = text.replace(/\d+\./g, '');
  text = text.replace(/1-0|0-1|1\/2-1\/2|\*/g, '');
  return text.trim();
}

function parseAlgebraicNotation(
  notation: string,
  board: Board,
  turnColor: 'white' | 'black',
  castlingRights: { whiteKingSide: boolean; whiteQueenSide: boolean; blackKingSide: boolean; blackQueenSide: boolean },
  enPassantTarget: { rank: Rank; file: File } | null,
): MovePayload | null {
  const cleaned = notation.replace(/[+#!?]+$/g, '');

  if (cleaned === 'O-O' || cleaned === '0-0') {
    const row = turnColor === 'white' ? 7 : 0;
    return {
      fromFile: 'e' as File,
      fromRank: (8 - row) as Rank,
      toFile: 'g' as File,
      toRank: (8 - row) as Rank,
    };
  }
  if (cleaned === 'O-O-O' || cleaned === '0-0-0') {
    const row = turnColor === 'white' ? 7 : 0;
    return {
      fromFile: 'e' as File,
      fromRank: (8 - row) as Rank,
      toFile: 'c' as File,
      toRank: (8 - row) as Rank,
    };
  }

  let promotion: 'queen' | 'rook' | 'bishop' | 'knight' | undefined;
  let moveStr = cleaned;
  if (cleaned.includes('=')) {
    const promoChar = cleaned.slice(-1).toLowerCase();
    promotion = promoChar === 'q' ? 'queen' : promoChar === 'r' ? 'rook' : promoChar === 'b' ? 'bishop' : 'knight';
    moveStr = cleaned.slice(0, -2);
  }

  const pieceMap: Record<string, string> = { K: 'king', Q: 'queen', R: 'rook', B: 'bishop', N: 'knight' };
  let pieceType: string | null = null;
  let fromFile: File | null = null;
  let fromRank: Rank | null = null;
  let toFile: File;
  let toRank: Rank;
  let isCapture = false;

  let idx = 0;
  if (moveStr[idx] && pieceMap[moveStr[idx]]) {
    pieceType = pieceMap[moveStr[idx]];
    idx++;
  } else {
    pieceType = 'pawn';
  }

  let disambig = '';
  while (idx < moveStr.length && moveStr[idx] !== 'x' && moveStr[idx] !== '-') {
    disambig += moveStr[idx];
    idx++;
  }

  if (moveStr[idx] === 'x') {
    isCapture = true;
    idx++;
  }

  const destStr = moveStr.slice(idx);
  if (destStr.length < 2) return null;
  toFile = destStr[0] as File;
  toRank = Number(destStr[1]) as Rank;

  if (disambig.length === 1) {
    if (disambig >= 'a' && disambig <= 'h') {
      fromFile = disambig as File;
    } else {
      fromRank = Number(disambig) as Rank;
    }
  } else if (disambig.length === 2) {
    fromFile = disambig[0] as File;
    fromRank = Number(disambig[1]) as Rank;
  }

  const legalMoves = getLegalMoves(
    {
      board,
      currentTurnColor: turnColor,
      castlingRights,
      enPassantTarget,
    } as ChessState,
    turnColor,
  );

  for (const move of legalMoves) {
    const matchesPiece = !pieceType || move.piece.type === pieceType;
    const matchesFrom = !fromFile || move.from.file === fromFile;
    const matchesFromRank = !fromRank || move.from.rank === fromRank;
    const matchesTo = move.to.file === toFile && move.to.rank === toRank;
    const matchesPromo = promotion ? move.promotion === promotion : !move.promotion;
    const isCaptureMove = !!move.captured || move.isEnPassant;

    if (matchesPiece && matchesFrom && matchesFromRank && matchesTo && matchesPromo && isCapture === isCaptureMove) {
      return {
        fromFile: move.from.file,
        fromRank: move.from.rank,
        toFile: move.to.file,
        toRank: move.to.rank,
        promotion: promotion ?? undefined,
      };
    }
  }

  return null;
}

export function parsePgn(pgn: string): PgnParseResult | null {
  const headers = parseHeaders(pgn);
  const moveText = extractMoveText(pgn);

  const tokens = moveText
    .split(/\s+/)
    .filter((t) => t.length > 0 && !/^\d+\.$/.test(t));

  if (tokens.length === 0) return null;

  const variant = headers.Variant?.toLowerCase().includes('chess960') ? 'chess960' : 'standard';
  const startFen = headers.FEN ?? INITIAL_BOARD_FEN;

  let board = parseFen(startFen);
  const castlingRights = { whiteKingSide: true, whiteQueenSide: true, blackKingSide: true, blackQueenSide: true };
  let enPassantTarget: { rank: Rank; file: File } | null = null;
  let turnColor: 'white' | 'black' = 'white';
  const moves: MovePayload[] = [];

  for (const token of tokens) {
    const move = parseAlgebraicNotation(token, board, turnColor, castlingRights, enPassantTarget);
    if (!move) return null;

    const fromRow = 8 - move.fromRank;
    const fromCol = FILES.indexOf(move.fromFile);
    const toRow = 8 - move.toRank;
    const toCol = FILES.indexOf(move.toFile);

    const piece = board[fromRow]?.[fromCol];
    if (!piece) return null;

    board = board.map((row) => [...row]);
    board[toRow][toCol] = move.promotion
      ? { type: move.promotion, color: turnColor } as ChessPiece
      : piece;
    board[fromRow][fromCol] = null;

    if (piece.type === 'king') {
      if (turnColor === 'white') {
        castlingRights.whiteKingSide = false;
        castlingRights.whiteQueenSide = false;
      } else {
        castlingRights.blackKingSide = false;
        castlingRights.blackQueenSide = false;
      }
    }
    if (piece.type === 'rook') {
      if (turnColor === 'white') {
        if (move.fromFile === 'h' && move.fromRank === 1) castlingRights.whiteKingSide = false;
        if (move.fromFile === 'a' && move.fromRank === 1) castlingRights.whiteQueenSide = false;
      } else {
        if (move.fromFile === 'h' && move.fromRank === 8) castlingRights.blackKingSide = false;
        if (move.fromFile === 'a' && move.fromRank === 8) castlingRights.blackQueenSide = false;
      }
    }

    if (piece.type === 'pawn' && Math.abs(move.toRank - move.fromRank) === 2) {
      const epRank = ((move.fromRank + move.toRank) / 2) as Rank;
      enPassantTarget = { rank: epRank, file: move.fromFile };
    } else {
      enPassantTarget = null;
    }

    turnColor = turnColor === 'white' ? 'black' : 'white';
    moves.push(move);
  }

  const finalFen = headers.FEN ?? startFen;

  return {
    headers,
    moves,
    fen: finalFen,
    variant,
  };
}

export function getPgnResultTag(result?: string): string {
  if (result === '1-0' || result === '0-1' || result === '1/2-1/2') return result;
  return '*';
}
