import { describe, it, expect } from 'vitest';
import { evaluateBoard, evaluateFen } from './position-evaluator';
import { parseFenPiecePlacement } from './fen';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

describe('parseFenPiecePlacement', () => {
  it('parses the starting position into an 8x8 board', () => {
    const board = parseFenPiecePlacement(START_FEN);
    expect(board).toHaveLength(8);
    expect(board.every((row) => row.length === 8)).toBe(true);
    expect(board[7][4]).toEqual({ type: 'king', color: 'white' });
    expect(board[0][4]).toEqual({ type: 'king', color: 'black' });
    expect(board[7][3]).toEqual({ type: 'queen', color: 'white' });
    expect(board[1][0]).toEqual({ type: 'pawn', color: 'black' });
    expect(board[6][0]).toEqual({ type: 'pawn', color: 'white' });
  });

  it('ignores trailing FEN fields (active color, castling, etc.)', () => {
    const board = parseFenPiecePlacement(`${START_FEN} w KQkq - 0 1`);
    expect(board[7][4]).toEqual({ type: 'king', color: 'white' });
  });

  it('rejects malformed FEN placements', () => {
    expect(() => parseFenPiecePlacement('rnbqkbnr/8/8/8/8/8/8')).toThrow();
    expect(() => parseFenPiecePlacement('xxxxxxxx/8/8/8/8/8/8/8')).toThrow();
  });
});

describe('evaluateBoard / evaluateFen', () => {
  it('evaluates the starting position to ~0 (symmetric)', () => {
    expect(evaluateFen(START_FEN)).toBe(0);
  });

  it('is strongly positive when white is up a queen', () => {
    const whiteUpQueen = 'rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    expect(evaluateFen(whiteUpQueen)).toBeGreaterThan(800);
  });

  it('is strongly negative when black is up a rook', () => {
    const blackUpRook = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBN1';
    expect(evaluateFen(blackUpRook)).toBeLessThan(-400);
  });

  it('prefers an advanced pawn to a stationary one', () => {
    const whiteAdvanced = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR';
    const whiteStill = START_FEN;
    expect(evaluateFen(whiteAdvanced)).toBeGreaterThan(evaluateFen(whiteStill));
  });

  it('returns integer centipawn scores', () => {
    const score = evaluateBoard(parseFenPiecePlacement(START_FEN));
    expect(Number.isInteger(score)).toBe(true);
  });
});
