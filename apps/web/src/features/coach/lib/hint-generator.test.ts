import { describe, it, expect } from 'vitest';
import { getChessHint, applyMove } from './hint-generator';
import { chessHintLabel } from '../ui/hint-label';
import { parseFenPiecePlacement } from '@/features/analysis/lib/fen';
import type {
  LegalMove,
  ChessPiece,
} from '@/widgets/BoardGames/ChessGame/types';

function boardFromFen(fen: string) {
  return parseFenPiecePlacement(fen);
}

function sq(file: string, rank: number) {
  return {
    file: file[0] as LegalMove['from']['file'],
    rank: rank as LegalMove['from']['rank'],
  };
}

function move(
  from: string,
  to: string,
  promotion: LegalMove['promotion'] = null,
): LegalMove {
  return {
    from: sq(from[0], Number(from[1])),
    to: sq(to[0], Number(to[1])),
    promotion,
  };
}

const NO_EN_PASSANT = null;

describe('getChessHint', () => {
  it('returns null when there are no legal moves', () => {
    const board = boardFromFen('7k/8/8/8/8/8/8/7K');
    expect(getChessHint(board, [], NO_EN_PASSANT, 'white')).toBeNull();
  });

  it('suggests capturing an undefended piece', () => {
    // White rook on e4 can take the black queen on e8 — clearly better than
    // a quiet rook move.
    const board = boardFromFen('4q3/8/8/8/4R3/8/8/8');
    const hint = getChessHint(
      board,
      [move('e4', 'e8'), move('e4', 'e5')],
      NO_EN_PASSANT,
      'white',
    );
    expect(hint).not.toBeNull();
    expect(hint?.to).toEqual(sq('e8', 8));
    expect(hint?.captured?.type).toBe('queen');
    expect(hint?.piece.type).toBe('rook');
  });

  it('scores from the mover\u2019s perspective for black', () => {
    // Black rook on f8 can capture the white queen on f1 → clearly winning
    // for black, so the hint score must be positive.
    const board = boardFromFen('5r2/8/8/8/8/8/8/5Q2');
    const hint = getChessHint(
      board,
      [move('f8', 'f1')],
      NO_EN_PASSANT,
      'black',
    );
    expect(hint).not.toBeNull();
    expect(hint?.captured?.type).toBe('queen');
    expect(hint ? hint.score : -1).toBeGreaterThan(0);
  });

  it('prefers a promotion move over a quiet pawn move', () => {
    const board = boardFromFen('8/P7/8/8/8/8/8/8');
    const hint = getChessHint(
      board,
      [move('a7', 'a8', 'queen'), move('a7', 'a8')],
      NO_EN_PASSANT,
      'white',
    );
    expect(hint).not.toBeNull();
    expect(hint?.promotion).toBe('queen');
    expect(hint?.to).toEqual(sq('a8', 8));
  });
});

describe('applyMove', () => {
  it('handles en-passant captures', () => {
    // White pawn e5, black pawn d5 (just moved two squares) → e5xd6 e.p.
    const board = boardFromFen('8/8/8/3pP3/8/8/8/8');
    const applied = applyMove(
      board,
      sq('e5', 5),
      sq('d6', 6),
      null,
      sq('d6', 6),
    );
    expect(applied).not.toBeNull();
    const next = applied?.board;
    const captured = applied?.captured as ChessPiece | null;
    expect(captured?.type).toBe('pawn');
    expect(captured?.color).toBe('black');
    // d6 (row 2, col 3) holds a white pawn, d5 (row 3, col 3) is empty.
    expect(next?.[2][3]).toEqual({ type: 'pawn', color: 'white' });
    expect(next?.[3][3]).toBeNull();
  });

  it('applies a kingside castle and moves the rook', () => {
    const board = boardFromFen('8/8/8/8/8/8/8/4K2R');
    const applied = applyMove(board, sq('e1', 1), sq('g1', 1), null, null);
    expect(applied).not.toBeNull();
    const next = applied?.board;
    // King on g1 (row 7, col 6), rook on f1 (row 7, col 5), e1/h1 empty.
    expect(next?.[7][6]).toEqual({ type: 'king', color: 'white' });
    expect(next?.[7][5]).toEqual({ type: 'rook', color: 'white' });
    expect(next?.[7][4]).toBeNull();
    expect(next?.[7][7]).toBeNull();
  });

  it('applies a queenside castle and moves the rook', () => {
    const board = boardFromFen('8/8/8/8/8/8/8/R3K3');
    const applied = applyMove(board, sq('e1', 1), sq('c1', 1), null, null);
    expect(applied).not.toBeNull();
    const next = applied?.board;
    expect(next?.[7][2]).toEqual({ type: 'king', color: 'white' });
    expect(next?.[7][3]).toEqual({ type: 'rook', color: 'white' });
    expect(next?.[7][4]).toBeNull();
    expect(next?.[7][0]).toBeNull();
  });

  it('applies a promotion', () => {
    const board = boardFromFen('8/P7/8/8/8/8/8/8');
    const applied = applyMove(board, sq('a7', 7), sq('a8', 8), 'queen', null);
    expect(applied).not.toBeNull();
    expect(applied?.board[0][0]).toEqual({ type: 'queen', color: 'white' });
  });

  it('returns null when no piece occupies the from square', () => {
    const board = boardFromFen('8/8/8/8/8/8/8/8');
    expect(applyMove(board, sq('e4', 4), sq('e5', 5), null, null)).toBeNull();
  });
});

describe('chessHintLabel', () => {
  const piece = { type: 'knight' as const, color: 'white' as const };

  it('returns the capture label for a capturing hint', () => {
    const label = chessHintLabel({
      from: sq('e4', 4),
      to: sq('d6', 6),
      piece,
      captured: { type: 'pawn', color: 'black' },
      promotion: null,
      isCastle: null,
      score: 300,
    });
    expect(label.key).toBe('games.chess_v1.coach.capture');
    expect(label.params.symbol).toBe('♘');
    expect(label.params.square).toBe('d6');
    expect(label.params.target).toBe('♟');
  });

  it('returns the move label for a quiet hint', () => {
    const label = chessHintLabel({
      from: sq('e4', 4),
      to: sq('e5', 5),
      piece,
      captured: null,
      promotion: null,
      isCastle: null,
      score: 10,
    });
    expect(label.key).toBe('games.chess_v1.coach.move');
    expect(label.params.square).toBe('e5');
  });

  it('returns the castle labels', () => {
    const king = { type: 'king' as const, color: 'white' as const };
    expect(
      chessHintLabel({
        from: sq('e1', 1),
        to: sq('g1', 1),
        piece: king,
        captured: null,
        promotion: null,
        isCastle: 'king',
        score: 0,
      }).key,
    ).toBe('games.chess_v1.coach.castleKing');
    expect(
      chessHintLabel({
        from: sq('e1', 1),
        to: sq('c1', 1),
        piece: king,
        captured: null,
        promotion: null,
        isCastle: 'queen',
        score: 0,
      }).key,
    ).toBe('games.chess_v1.coach.castleQueen');
  });

  it('returns the promotion label for a promoting hint', () => {
    const label = chessHintLabel({
      from: sq('a7', 7),
      to: sq('a8', 8),
      piece: { type: 'pawn' as const, color: 'white' as const },
      captured: null,
      promotion: 'queen',
      isCastle: null,
      score: 900,
    });
    expect(label.key).toBe('games.chess_v1.coach.promote');
    expect(label.params.promotion).toBe('♕');
  });
});
