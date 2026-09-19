import type { Board, BoardPosition, PieceColor, Rank } from '../types';
import { FILES } from '../types';

const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8];

function isWithinBoard(fileIdx: number, rankIdx: number): boolean {
  return fileIdx >= 0 && fileIdx < 8 && rankIdx >= 0 && rankIdx < 8;
}

export function getPseudoLegalMovesForSquare(
  board: Board,
  pos: BoardPosition,
  color: PieceColor,
): BoardPosition[] {
  const fromFileIdx = FILES.indexOf(pos.file);
  const fromRankIdx = RANKS.indexOf(pos.rank);
  const fromRow = 8 - pos.rank;
  const piece = board[fromRow]?.[fromFileIdx];

  if (!piece || piece.color !== color) return [];

  const targets: BoardPosition[] = [];

  const addIfValid = (fileIdx: number, rankIdx: number): boolean => {
    if (!isWithinBoard(fileIdx, rankIdx)) return false;
    const r = 8 - RANKS[rankIdx];
    const targetPiece = board[r]?.[fileIdx];
    if (targetPiece?.color === color) return false;
    targets.push({ file: FILES[fileIdx], rank: RANKS[rankIdx] });
    return targetPiece === null;
  };

  switch (piece.type) {
    case 'pawn': {
      const dir = color === 'white' ? 1 : -1;
      const startRankIdx = color === 'white' ? 1 : 6;
      const oneStepRank = fromRankIdx + dir;
      if (isWithinBoard(fromFileIdx, oneStepRank)) {
        const r1 = 8 - RANKS[oneStepRank];
        if (!board[r1]?.[fromFileIdx]) {
          targets.push({ file: pos.file, rank: RANKS[oneStepRank] });
          const twoStepRank = fromRankIdx + 2 * dir;
          if (
            fromRankIdx === startRankIdx &&
            isWithinBoard(fromFileIdx, twoStepRank)
          ) {
            const r2 = 8 - RANKS[twoStepRank];
            if (!board[r2]?.[fromFileIdx]) {
              targets.push({ file: pos.file, rank: RANKS[twoStepRank] });
            }
          }
        }
      }
      for (const diagFile of [fromFileIdx - 1, fromFileIdx + 1]) {
        if (isWithinBoard(diagFile, oneStepRank)) {
          const rDiag = 8 - RANKS[oneStepRank];
          const target = board[rDiag]?.[diagFile];
          if (!target || target.color !== color) {
            targets.push({ file: FILES[diagFile], rank: RANKS[oneStepRank] });
          }
        }
      }
      break;
    }

    case 'knight': {
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
      for (const [df, dr] of jumps) {
        addIfValid(fromFileIdx + df, fromRankIdx + dr);
      }
      break;
    }

    case 'bishop': {
      const directions = [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ];
      for (const [df, dr] of directions) {
        let f = fromFileIdx + df;
        let r = fromRankIdx + dr;
        while (addIfValid(f, r)) {
          f += df;
          r += dr;
        }
      }
      break;
    }

    case 'rook': {
      const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      for (const [df, dr] of directions) {
        let f = fromFileIdx + df;
        let r = fromRankIdx + dr;
        while (addIfValid(f, r)) {
          f += df;
          r += dr;
        }
      }
      break;
    }

    case 'queen': {
      const directions = [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      for (const [df, dr] of directions) {
        let f = fromFileIdx + df;
        let r = fromRankIdx + dr;
        while (addIfValid(f, r)) {
          f += df;
          r += dr;
        }
      }
      break;
    }

    case 'king': {
      const deltas = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ];
      for (const [df, dr] of deltas) {
        addIfValid(fromFileIdx + df, fromRankIdx + dr);
      }

      const homeRankIdx = color === 'white' ? 0 : 7;
      if (fromRankIdx === homeRankIdx && fromFileIdx === 4) {
        const rightClear = !board[fromRow]?.[5] && !board[fromRow]?.[6];
        if (
          rightClear &&
          board[fromRow]?.[7]?.type === 'rook' &&
          board[fromRow]?.[7]?.color === color
        ) {
          targets.push({ file: FILES[6], rank: RANKS[homeRankIdx] });
        }

        const leftClear =
          !board[fromRow]?.[3] && !board[fromRow]?.[2] && !board[fromRow]?.[1];
        if (
          leftClear &&
          board[fromRow]?.[0]?.type === 'rook' &&
          board[fromRow]?.[0]?.color === color
        ) {
          targets.push({ file: FILES[2], rank: RANKS[homeRankIdx] });
        }
      }
      break;
    }
  }

  return targets;
}
