import { FILES, PROMOTION_PIECES } from './chess.constants';
import type { PieceColor, PieceType } from './chess.constants';
import type {
  Board,
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
import { isInCheck } from './chess.attacks';

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
      state.enPassantTarget.rank === ((oneStepRank + 1) as Rank) &&
      state.enPassantTarget.file === FILES[targetFile]
    ) {
      const capturedPawn = getPiece(
        state.board,
        boardCoordsToPos(oneStepRank, targetFile),
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

  if (piece.color === 'white') {
    if (
      state.castlingRights.whiteKingSide &&
      !state.board[7][5] &&
      !state.board[7][6] &&
      state.board[7][7]?.type === 'rook'
    ) {
      moves.push(
        createMove(
          state,
          pos,
          boardCoordsToPos(7, 6),
          piece,
          null,
          null,
          false,
          true,
        ),
      );
    }
    if (
      state.castlingRights.whiteQueenSide &&
      !state.board[7][1] &&
      !state.board[7][2] &&
      !state.board[7][3] &&
      state.board[7][0]?.type === 'rook'
    ) {
      moves.push(
        createMove(
          state,
          pos,
          boardCoordsToPos(7, 2),
          piece,
          null,
          null,
          false,
          true,
        ),
      );
    }
  } else {
    if (
      state.castlingRights.blackKingSide &&
      !state.board[0][5] &&
      !state.board[0][6] &&
      state.board[0][7]?.type === 'rook'
    ) {
      moves.push(
        createMove(
          state,
          pos,
          boardCoordsToPos(0, 6),
          piece,
          null,
          null,
          false,
          true,
        ),
      );
    }
    if (
      state.castlingRights.blackQueenSide &&
      !state.board[0][1] &&
      !state.board[0][2] &&
      !state.board[0][3] &&
      state.board[0][0]?.type === 'rook'
    ) {
      moves.push(
        createMove(
          state,
          pos,
          boardCoordsToPos(0, 2),
          piece,
          null,
          null,
          false,
          true,
        ),
      );
    }
  }

  return moves;
}

function createMove(
  state: ChessState,
  from: BoardPosition,
  to: BoardPosition,
  piece: ChessPiece,
  captured: ChessPiece | null,
  promotion: PieceType | null,
  isEnPassant = false,
  isCastle = false,
): ChessMove {
  const notation = buildNotation(
    from,
    to,
    piece,
    captured,
    promotion,
    isCastle,
    isEnPassant,
  );
  return {
    from,
    to,
    piece,
    captured,
    promotion,
    isCastle,
    isEnPassant,
    notation,
  };
}

function buildNotation(
  from: BoardPosition,
  to: BoardPosition,
  piece: ChessPiece,
  captured: ChessPiece | null,
  promotion: PieceType | null,
  isCastle: boolean,
  isEnPassant: boolean,
): string {
  if (isCastle) {
    const toFile = to.file.charCodeAt(0) - 97;
    return toFile === 6 ? 'O-O' : 'O-O-O';
  }

  let notation = '';
  if (piece.type !== 'pawn') {
    notation += piece.type.charAt(0).toUpperCase();
  }

  if (captured || isEnPassant) {
    if (piece.type === 'pawn') {
      notation += from.file;
    }
    notation += 'x';
  }

  notation += `${to.file}${to.rank}`;

  if (promotion) {
    notation += `=${promotion.charAt(0).toUpperCase()}`;
  }

  return notation;
}

export function simulateMove(state: ChessState, move: ChessMove): Board {
  const board = structuredClone(state.board);
  const { rank: fr, file: ff } = posToBoardCoords(move.from);
  const { rank: tr, file: tf } = posToBoardCoords(move.to);

  if (move.isEnPassant) {
    board[fr][tf] = null;
  }

  board[tr][tf] = move.promotion
    ? { type: move.promotion, color: move.piece.color }
    : board[fr][ff];
  board[fr][ff] = null;

  if (move.isCastle) {
    if (tf === 6) {
      board[tr][5] = board[tr][7];
      board[tr][7] = null;
    } else if (tf === 2) {
      board[tr][3] = board[tr][0];
      board[tr][0] = null;
    }
  }

  return board;
}
