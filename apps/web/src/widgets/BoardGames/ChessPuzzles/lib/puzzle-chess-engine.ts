import type {
  Board,
  BoardPosition,
  File,
  Rank,
  ChessPiece,
  ChessState,
} from '@arcadeum/games-core/games/chess/chess.types';
import type {
  PieceColor,
  PieceType,
} from '@arcadeum/games-core/games/chess/chess.constants';
import {
  posToBoardCoords,
  findKing,
  oppositeColor,
} from '@arcadeum/games-core/games/chess/chess.board';
import { isInCheck } from '@arcadeum/games-core/games/chess/chess.attacks';
import { getLegalMoves } from '@arcadeum/games-core/games/chess/chess.move-generator';
import { parseFenPiecePlacement } from '@/features/analysis/lib/fen';

const PROMO_MAP: Record<string, PieceType> = {
  q: 'queen',
  r: 'rook',
  b: 'bishop',
  n: 'knight',
};

export function parseUciMove(uci: string): {
  from: BoardPosition;
  to: BoardPosition;
  promo?: PieceType;
} {
  const fromFile = uci[0] as File;
  const fromRank = parseInt(uci[1] ?? '1', 10) as Rank;
  const toFile = uci[2] as File;
  const toRank = parseInt(uci[3] ?? '1', 10) as Rank;
  const promoChar = uci[4]?.toLowerCase();
  const promo = promoChar ? PROMO_MAP[promoChar] : undefined;

  return {
    from: { file: fromFile, rank: fromRank },
    to: { file: toFile, rank: toRank },
    promo,
  };
}

export function applyUciMoveToBoard(
  board: Board,
  uci: string,
): {
  nextBoard: Board;
  isCapture: boolean;
  isCheck: boolean;
  kingPos: BoardPosition | null;
} {
  const { from, to, promo } = parseUciMove(uci);
  const { rank: fr, file: ff } = posToBoardCoords(from);
  const { rank: tr, file: tf } = posToBoardCoords(to);

  const movingPiece = board[fr]?.[ff];
  if (!movingPiece) {
    return {
      nextBoard: board,
      isCapture: false,
      isCheck: false,
      kingPos: null,
    };
  }

  const nextBoard: Board = board.map((row) => [...row]);
  const targetPiece = board[tr]?.[tf];
  let isCapture = targetPiece !== null && targetPiece !== undefined;

  if (movingPiece.type === 'pawn' && ff !== tf && !targetPiece) {
    nextBoard[fr][tf] = null;
    isCapture = true;
  }

  if (movingPiece.type === 'king' && Math.abs(tf - ff) === 2) {
    if (tf === 6) {
      nextBoard[tr][5] = nextBoard[tr][7];
      nextBoard[tr][7] = null;
    } else if (tf === 2) {
      nextBoard[tr][3] = nextBoard[tr][0];
      nextBoard[tr][0] = null;
    }
  }

  const pieceToPlace: ChessPiece = promo
    ? { type: promo, color: movingPiece.color }
    : movingPiece;

  nextBoard[tr][tf] = pieceToPlace;
  nextBoard[fr][ff] = null;

  const opponentColor = oppositeColor(movingPiece.color);
  const isCheck = isInCheck(nextBoard, opponentColor);
  const kingPos = findKing(nextBoard, opponentColor);

  return {
    nextBoard,
    isCapture,
    isCheck,
    kingPos,
  };
}

export function getLegalDestinations(
  board: Board,
  turnColor: PieceColor,
  from: BoardPosition,
): BoardPosition[] {
  const dummyState: ChessState = {
    variant: 'standard',
    gameCreatedAt: 0,
    timeControl: null,
    board,
    currentTurnColor: turnColor,
    castlingRights: {
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true,
    },
    enPassantTarget: null,
    halfMoveClock: 0,
    fullMoveNumber: 1,
    moveHistory: [],
    players: [
      { playerId: 'white', color: 'white', isBot: false },
      { playerId: 'black', color: 'black', isBot: false },
    ],
    winnerColor: null,
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    isDrawByRepetition: false,
    isDrawByFiftyMoveRule: false,
    isInsufficientMaterial: false,
    isDrawByAgreement: false,
    drawOfferedBy: null,
    takebackOfferedBy: null,
    takebackMoveIndex: null,
    clocks: null,
    positionHistory: [],
    currentTurnIndex: 0,
    logs: [],
    legalMovesForCurrentPlayer: [],
  };

  const legalMoves = getLegalMoves(dummyState, turnColor);
  return legalMoves
    .filter((m) => m.from.file === from.file && m.from.rank === from.rank)
    .map((m) => m.to);
}

export function getPuzzleInitialBoard(fen: string): Board {
  return parseFenPiecePlacement(fen);
}

export function getPuzzleTurnColor(fen: string): PieceColor {
  const parts = fen.split(' ');
  return (parts[1] === 'b' ? 'black' : 'white') as PieceColor;
}
