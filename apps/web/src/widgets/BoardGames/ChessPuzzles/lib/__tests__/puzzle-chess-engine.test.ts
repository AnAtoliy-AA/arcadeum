import { describe, expect, it } from 'vitest';
import {
  parseUciMove,
  applyUciMoveToBoard,
  getLegalDestinations,
  getPuzzleInitialBoard,
  getPuzzleTurnColor,
} from '../puzzle-chess-engine';

describe('puzzle-chess-engine', () => {
  it('parses standard UCI moves correctly', () => {
    const parsed = parseUciMove('e2e4');
    expect(parsed.from).toEqual({ file: 'e', rank: 2 });
    expect(parsed.to).toEqual({ file: 'e', rank: 4 });
    expect(parsed.promo).toBeUndefined();
  });

  it('parses promotion UCI moves correctly', () => {
    const parsed = parseUciMove('e7e8q');
    expect(parsed.from).toEqual({ file: 'e', rank: 7 });
    expect(parsed.to).toEqual({ file: 'e', rank: 8 });
    expect(parsed.promo).toBe('queen');
  });

  it('extracts initial board and turn color from FEN', () => {
    const fen =
      'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5';
    const board = getPuzzleInitialBoard(fen);
    expect(board.length).toBe(8);
    expect(board[0].length).toBe(8);
    expect(getPuzzleTurnColor(fen)).toBe('white');

    const blackFen =
      'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 5';
    expect(getPuzzleTurnColor(blackFen)).toBe('black');
  });

  it('applies simple move and updates board state', () => {
    const fen = '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1';
    const initialBoard = getPuzzleInitialBoard(fen);

    const { nextBoard, isCapture, isCheck } = applyUciMoveToBoard(
      initialBoard,
      'e1e8',
    );

    expect(nextBoard[7][4]).toBeNull();
    expect(nextBoard[0][4]).toEqual({ type: 'rook', color: 'white' });
    expect(isCapture).toBe(false);
    expect(isCheck).toBe(true);
  });

  it('applies capture move and updates isCapture flag', () => {
    const fen =
      'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5';
    const board = getPuzzleInitialBoard(fen);

    const { nextBoard, isCapture, isCheck } = applyUciMoveToBoard(
      board,
      'c4f7',
    );

    expect(isCapture).toBe(true);
    expect(isCheck).toBe(true);
    expect(nextBoard[1][5]).toEqual({ type: 'bishop', color: 'white' });
  });

  it('calculates legal destinations for a selected square', () => {
    const fen = '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1';
    const board = getPuzzleInitialBoard(fen);

    const destinations = getLegalDestinations(board, 'white', {
      file: 'e',
      rank: 1,
    });

    expect(destinations.length).toBeGreaterThan(0);
    expect(destinations).toContainEqual({ file: 'e', rank: 8 });
  });
});
