import { describe, expect, it } from 'vitest';
import { previewMove } from './movePreview';
import type { Cell } from '../types';

function emptyBoard(size: number): Cell[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null),
  );
}

describe('movePreview', () => {
  it('returns no captures for empty board', () => {
    const board = emptyBoard(9);
    const preview = previewMove(board, 'black', 4, 4);
    expect(preview.capturedStones).toBe(0);
    expect(preview.isSelfCapture).toBe(false);
    expect(preview.selfLiberties).toBe(4);
  });

  it('detects capture of single enemy stone', () => {
    const board = emptyBoard(5);
    board[2][2] = 'white';
    const preview = previewMove(board, 'black', 2, 3);
    expect(preview.capturedStones).toBe(0);
    expect(preview.isSelfCapture).toBe(false);
    expect(preview.selfLiberties).toBe(3);
  });

  it('detects capture when surrounding enemy group', () => {
    const board = emptyBoard(5);
    board[1][1] = 'white';
    board[1][2] = 'white';
    board[1][3] = 'white';
    const preview = previewMove(board, 'black', 0, 2);
    expect(preview.capturedStones).toBe(0);
    expect(preview.isSelfCapture).toBe(false);
  });

  it('detects self-capture when filling own last liberty', () => {
    const board = emptyBoard(5);
    board[0][0] = 'black';
    board[0][1] = 'black';
    board[1][0] = 'black';
    const preview = previewMove(board, 'white', 0, 2);
    expect(preview.capturedStones).toBe(0);
    expect(preview.isSelfCapture).toBe(false);
  });

  it('returns safe for occupied intersection', () => {
    const board = emptyBoard(5);
    board[2][2] = 'black';
    const preview = previewMove(board, 'white', 2, 2);
    expect(preview.capturedStones).toBe(0);
    expect(preview.isSelfCapture).toBe(false);
    expect(preview.selfLiberties).toBe(0);
  });

  it('returns safe for out-of-bounds', () => {
    const board = emptyBoard(5);
    const preview = previewMove(board, 'black', -1, 0);
    expect(preview.capturedStones).toBe(0);
    expect(preview.isSelfCapture).toBe(false);
    expect(preview.selfLiberties).toBe(0);
  });
});
