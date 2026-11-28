import { FILES, PROMOTION_PIECES } from './chess.constants';
import type { PieceColor } from './chess.constants';
import type {
  BoardPosition,
  ChessMove,
  ChessPiece,
  ChessState,
  Rank,
} from './chess.types';
import {
  isOnBoard,
  boardCoordsToPos,
  posToBoardCoords,
  getPiece,
} from './chess.board';
import { isInCheck, isSquareAttacked } from './chess.attacks';
import { createMove, simulateMove } from './chess.move-utils';
import {
  CASTLE_KING_TARGET,
  CASTLE_ROOK_TARGET,
  backRankRow,
  getCastlingRookFile,
  rightsKey,
} from './chess.castling';

export function generatePseudoLegalMoves(
  state: ChessState,
  color: PieceColor,
): ChessMove[] {
  const moves: ChessMove[] = [];
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = state.board[r][f];
      if (!piece || piece.color !== color) continue;
      const pos = boardCoordsToPos(r, f);
      const pieceMoves = generatePieceMoves(state, pos, piece);
      moves.push(...pieceMoves);
    }
  }
  return moves;
}

export function getLegalMoves(
  state: ChessState,
  color: PieceColor,
): ChessMove[] {
  const pseudoLegal = generatePseudoLegalMoves(state, color);
  const legal = pseudoLegal.filter((move) => {
    if (move.captured?.type === 'king') return false;
    const simulated = simulateMove(state, move);
    return !isInCheck(simulated, color);
  });
  return addSanDisambiguation(legal);
}

/**
 * SAN disambiguation (FIDE Appendix C.10): when two pieces of the same type
 * can reach the same square, add the origin file, else the rank, else both.
 */
export function addSanDisambiguation(moves: ChessMove[]): ChessMove[] {
  return moves.map((move) => {
    if (move.piece.type === 'pawn' || move.piece.type === 'king') return move;
    const rivals = moves.filter(
      (m) =>
        m !== move &&
        m.piece.type === move.piece.type &&
        m.to.file === move.to.file &&
        m.to.rank === move.to.rank &&
        (m.from.file !== move.from.file || m.from.rank !== move.from.rank),
    );
    if (rivals.length === 0) return move;
    const sameFile = rivals.some((m) => m.from.file === move.from.file);
    const sameRank = rivals.some((m) => m.from.rank === move.from.rank);
    let disambiguator: string;
    if (!sameFile) disambiguator = move.from.file;
    else if (!sameRank) disambiguator = String(move.from.rank);
    else disambiguator = `${move.from.file}${move.from.rank}`;
    return {
      ...move,
      notation: `${move.notation[0]}${disambiguator}${move.notation.slice(1)}`,
    };
  });
}

function generatePieceMoves(
  state: ChessState,
  pos: BoardPosition,
  piece: ChessPiece,
): ChessMove[] {
  const { rank, file } = posToBoardCoords(pos);

  switch (piece.type) {
    case 'pawn':
      return generatePawnMoves(state, rank, file, piece);
    case 'knight':
      return generateKnightMoves(state, rank, file, piece);
    case 'bishop':
      return generateSlidingMoves(state, rank, file, piece, [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]);
    case 'rook':
      return generateSlidingMoves(state, rank, file, piece, [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]);
    case 'queen':
      return generateSlidingMoves(state, rank, file, piece, [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]);
    case 'king':
      return generateKingMoves(state, rank, file, piece);
  }
}

function generatePawnMoves(
  state: ChessState,
  rank: number,
  file: number,
  piece: ChessPiece,
): ChessMove[] {
  const moves: ChessMove[] = [];
  const direction = piece.color === 'white' ? -1 : 1;
  const startRank = piece.color === 'white' ? 6 : 1;
  const promotionRank = piece.color === 'white' ? 0 : 7;
  const pos = boardCoordsToPos(rank, file);

  const oneStepRank = rank + direction;
  if (isOnBoard(oneStepRank, file) && !state.board[oneStepRank][file]) {
    if (oneStepRank === promotionRank) {
      for (const promo of PROMOTION_PIECES) {
        moves.push(
          createMove(
            state,
            pos,
            boardCoordsToPos(oneStepRank, file),
            piece,
            null,
            promo,
          ),
        );
      }
    } else {
      moves.push(
        createMove(
          state,
          pos,
          boardCoordsToPos(oneStepRank, file),
          piece,
          null,
          null,
        ),
      );
    }

    if (rank === startRank) {
      const twoStepRank = rank + 2 * direction;
      if (!state.board[twoStepRank][file]) {
        moves.push(
          createMove(
            state,
            pos,
            boardCoordsToPos(twoStepRank, file),
            piece,
            null,
            null,
          ),
        );
      }
    }
  }

  for (const df of [-1, 1]) {
    const targetFile = file + df;
    if (!isOnBoard(oneStepRank, targetFile)) continue;
    const targetPos = boardCoordsToPos(oneStepRank, targetFile);
    const targetPiece = getPiece(state.board, targetPos);

    if (targetPiece && targetPiece.color !== piece.color) {
      if (oneStepRank === promotionRank) {
        for (const promo of PROMOTION_PIECES) {
          moves.push(
            createMove(state, pos, targetPos, piece, targetPiece, promo),
          );
        }
      } else {
        moves.push(createMove(state, pos, targetPos, piece, targetPiece, null));
      }
    }

    if (
      state.enPassantTarget &&
      state.enPassantTarget.rank === ((8 - oneStepRank) as Rank) &&
      state.enPassantTarget.file === FILES[targetFile]
    ) {
      const capturedPawn = getPiece(
        state.board,
        boardCoordsToPos(rank, targetFile),
      );
      if (
        capturedPawn &&
        capturedPawn.type === 'pawn' &&
        capturedPawn.color !== piece.color &&
        !targetPiece
      ) {
        moves.push(
          createMove(state, pos, targetPos, piece, capturedPawn, null, true),
        );
      }
    }
  }

  return moves;
}

function generateKnightMoves(
  state: ChessState,
  rank: number,
  file: number,
  piece: ChessPiece,
): ChessMove[] {
  const moves: ChessMove[] = [];
  const jumps = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];
  const pos = boardCoordsToPos(rank, file);

  for (const [dr, df] of jumps) {
    const nr = rank + dr;
    const nf = file + df;
    if (!isOnBoard(nr, nf)) continue;
    const target = getPiece(state.board, boardCoordsToPos(nr, nf));
    if (target && target.color === piece.color) continue;
    moves.push(
      createMove(state, pos, boardCoordsToPos(nr, nf), piece, target, null),
    );
  }

  return moves;
}

function generateSlidingMoves(
  state: ChessState,
  rank: number,
  file: number,
  piece: ChessPiece,
  directions: number[][],
): ChessMove[] {
  const moves: ChessMove[] = [];
  const pos = boardCoordsToPos(rank, file);

  for (const [dr, df] of directions) {
    let nr = rank + dr;
    let nf = file + df;
    while (isOnBoard(nr, nf)) {
      const target = getPiece(state.board, boardCoordsToPos(nr, nf));
      if (target) {
        if (target.color !== piece.color) {
          moves.push(
            createMove(
              state,
              pos,
              boardCoordsToPos(nr, nf),
              piece,
              target,
              null,
            ),
          );
        }
        break;
      }
      moves.push(
        createMove(state, pos, boardCoordsToPos(nr, nf), piece, null, null),
      );
      nr += dr;
      nf += df;
    }
  }

  return moves;
}

function generateKingMoves(
  state: ChessState,
  rank: number,
  file: number,
  piece: ChessPiece,
): ChessMove[] {
  const moves: ChessMove[] = [];
  const pos = boardCoordsToPos(rank, file);
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (const [dr, df] of directions) {
    const nr = rank + dr;
    const nf = file + df;
    if (!isOnBoard(nr, nf)) continue;
    const target = getPiece(state.board, boardCoordsToPos(nr, nf));
    if (target && target.color === piece.color) continue;
    moves.push(
      createMove(state, pos, boardCoordsToPos(nr, nf), piece, target, null),
    );
  }

  moves.push(...generateCastlingMoves(state, rank, file, piece));
  return moves;
}

/**
 * FIDE 3.8.2 castling, generalised for Chess960: the king and the castling
 * rook must be on the back rank, every square they cross or land on must be
 * empty (apart from the two castling pieces), and the king may not be in
 * check, pass through an attacked square, or land on one.
 */
function generateCastlingMoves(
  state: ChessState,
  rank: number,
  kingFile: number,
  piece: ChessPiece,
): ChessMove[] {
  const color = piece.color;
  if (rank !== backRankRow(color) || !state.castlingRights) return [];
  const opponent = color === 'white' ? 'black' : 'white';
  const kingPos = boardCoordsToPos(rank, kingFile);
  if (isSquareAttacked(state.board, kingPos, opponent)) return [];

  const moves: ChessMove[] = [];
  const is960 = state.variant === 'chess960';
  for (const side of ['kingSide', 'queenSide'] as const) {
    if (!state.castlingRights[rightsKey(color, side)]) continue;
    const rookFile = getCastlingRookFile(state, color, side);
    if (rookFile === null) continue;
    if (side === 'kingSide' ? rookFile <= kingFile : rookFile >= kingFile) {
      continue;
    }
    const rook = state.board[rank][rookFile];
    if (rook?.type !== 'rook' || rook.color !== color) continue;

    const kingTarget = CASTLE_KING_TARGET[side];
    const rookTarget = CASTLE_ROOK_TARGET[side];
    const lo = Math.min(kingFile, kingTarget, rookFile, rookTarget);
    const hi = Math.max(kingFile, kingTarget, rookFile, rookTarget);
    let clear = true;
    for (let f = lo; f <= hi; f++) {
      if (f === kingFile || f === rookFile) continue;
      if (state.board[rank][f]) {
        clear = false;
        break;
      }
    }
    if (!clear) continue;

    // Test the king's path with both castling pieces lifted off the board.
    const probe = state.board.map((row) => [...row]);
    probe[rank][kingFile] = null;
    probe[rank][rookFile] = null;
    const step = kingTarget >= kingFile ? 1 : -1;
    let pathSafe = true;
    for (let f = kingFile; f !== kingTarget + step; f += step) {
      if (isSquareAttacked(probe, boardCoordsToPos(rank, f), opponent)) {
        pathSafe = false;
        break;
      }
    }
    if (!pathSafe) continue;

    // Chess960 uses king-takes-own-rook encoding so the move can never be
    // confused with an ordinary king step to the same square.
    const toFile = is960 ? rookFile : kingTarget;
    if (!is960 && toFile === kingFile) continue;
    moves.push(
      createMove(
        state,
        kingPos,
        boardCoordsToPos(rank, toFile),
        piece,
        null,
        null,
        false,
        true,
      ),
    );
  }
  return moves;
}

export { simulateMove } from './chess.move-utils';
