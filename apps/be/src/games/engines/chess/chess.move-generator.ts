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
  return pseudoLegal.filter((move) => {
    if (move.captured?.type === 'king') return false;
    const simulated = simulateMove(state, move);
    return !isInCheck(simulated, color);
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
      if (capturedPawn) {
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

function findRookFileForCastling(
  board: (ChessPiece | null)[][],
  rank: number,
  kingFile: number,
  direction: 'left' | 'right',
): number | null {
  const start = direction === 'left' ? kingFile - 1 : kingFile + 1;
  const end = direction === 'left' ? -1 : 8;
  const step = direction === 'left' ? -1 : 1;

  for (let f = start; f !== end; f += step) {
    if (board[rank][f]?.type === 'rook') return f;
  }
  return null;
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

  const opponent = piece.color === 'white' ? 'black' : 'white';
  const backRank = piece.color === 'white' ? 7 : 0;

  if (!isSquareAttacked(state.board, pos, opponent)) {
    if (
      state.castlingRights[
        piece.color === 'white' ? 'whiteKingSide' : 'blackKingSide'
      ]
    ) {
      const rookFile = findRookFileForCastling(
        state.board,
        backRank,
        file,
        'right',
      );
      if (rookFile !== null) {
        let clear = true;
        for (let f = file + 1; f < rookFile; f++) {
          if (state.board[backRank][f]) {
            clear = false;
            break;
          }
        }
        if (clear) {
          let pathSafe = true;
          for (let f = file + 1; f < 6; f++) {
            if (
              isSquareAttacked(
                state.board,
                boardCoordsToPos(backRank, f),
                opponent,
              )
            ) {
              pathSafe = false;
              break;
            }
          }
          if (pathSafe) {
            moves.push(
              createMove(
                state,
                pos,
                boardCoordsToPos(backRank, 6),
                piece,
                null,
                null,
                false,
                true,
              ),
            );
          }
        }
      }
    }
    if (
      state.castlingRights[
        piece.color === 'white' ? 'whiteQueenSide' : 'blackQueenSide'
      ]
    ) {
      const rookFile = findRookFileForCastling(
        state.board,
        backRank,
        file,
        'left',
      );
      if (rookFile !== null) {
        let clear = true;
        for (let f = rookFile + 1; f < file; f++) {
          if (state.board[backRank][f]) {
            clear = false;
            break;
          }
        }
        if (clear) {
          let pathSafe = true;
          for (let f = 3; f < file; f++) {
            if (
              isSquareAttacked(
                state.board,
                boardCoordsToPos(backRank, f),
                opponent,
              )
            ) {
              pathSafe = false;
              break;
            }
          }
          if (pathSafe) {
            moves.push(
              createMove(
                state,
                pos,
                boardCoordsToPos(backRank, 2),
                piece,
                null,
                null,
                false,
                true,
              ),
            );
          }
        }
      }
    }
  }

  return moves;
}

export { simulateMove } from './chess.move-utils';
