import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateCustomPuzzle,
  saveCustomPuzzle,
  loadCustomPuzzles,
  deleteCustomPuzzle,
  encodePuzzleShare,
  decodePuzzleShare,
  exportCustomPuzzlesJson,
  importCustomPuzzlesJson,
} from '../custom-puzzles';

describe('custom-puzzles', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('validates a correct FEN and legal move sequence', () => {
    const fen = '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1';
    const moves = ['e1e8'];
    const res = validateCustomPuzzle(fen, moves);
    expect(res.error).toBeUndefined();
    expect(res.valid).toBe(true);
    expect(res.plyCount).toBe(1);
    expect(res.turn).toBe('white');
  });

  it('rejects an empty FEN or invalid format', () => {
    const res = validateCustomPuzzle('', ['e2e4']);
    expect(res.valid).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('rejects an illegal move in the sequence', () => {
    const fen = '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1';
    const moves = ['e1a8'];
    const res = validateCustomPuzzle(fen, moves);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('illegal');
  });

  it('saves, loads, and deletes custom puzzles in local storage', () => {
    const input = {
      title: 'My Custom Mate',
      fen: '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1',
      moves: ['e1e8'],
      rating: 1400,
      themes: ['backRankMate'],
    };

    const created = saveCustomPuzzle(input);
    expect(created.puzzleId).toBeDefined();

    const list = loadCustomPuzzles();
    expect(list.length).toBe(1);
    expect(list[0]?.fen).toBe(input.fen);

    deleteCustomPuzzle(created.puzzleId);
    expect(loadCustomPuzzles().length).toBe(0);
  });

  it('encodes and decodes shareable puzzle URL data', () => {
    const puzzle = {
      puzzleId: 'test_123',
      fen: '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1',
      moves: ['e1e8'],
      rating: 1200,
      themes: ['mateIn1'],
      openingTags: ['Back Rank Puzzle'],
    };

    const encoded = encodePuzzleShare(puzzle);
    expect(encoded.length).toBeGreaterThan(10);

    const decoded = decodePuzzleShare(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.fen).toBe(puzzle.fen);
    expect(decoded?.moves).toEqual(puzzle.moves);
    expect(decoded?.rating).toBe(puzzle.rating);
  });

  it('exports and imports custom puzzles JSON', () => {
    saveCustomPuzzle({
      title: 'Export Test',
      fen: '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1',
      moves: ['e1e8'],
      rating: 1300,
      themes: ['endgame'],
    });

    const exported = exportCustomPuzzlesJson();
    expect(exported).toContain('Export Test');

    localStorage.clear();
    const importedCount = importCustomPuzzlesJson(exported);
    expect(importedCount).toBe(1);
    expect(loadCustomPuzzles().length).toBe(1);
  });
});
