import { describe, it, expect } from 'vitest';
import {
  parsePgn,
  CLASSIC_PGN_STUDIES,
  extractPuzzleFromStudy,
  convertPgnToCustomPuzzle,
} from '../pgn-puzzle-extractor';

describe('pgn-puzzle-extractor', () => {
  it('parses headers and moves from PGN string', () => {
    const pgn = `[Event "World Championship"]
[White "Kasparov"]
[Black "Karpov"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 1-0`;

    const parsed = parsePgn(pgn);
    expect(parsed.headers.Event).toBe('World Championship');
    expect(parsed.headers.White).toBe('Kasparov');
    expect(parsed.headers.Black).toBe('Karpov');
    expect(parsed.moves).toEqual(['e4', 'e5', 'Nf3', 'Nc6', 'Bb5']);
  });

  it('handles classic PGN studies', () => {
    expect(CLASSIC_PGN_STUDIES.length).toBeGreaterThan(1);
    const study0 = extractPuzzleFromStudy(0);
    expect(study0).not.toBeNull();
    expect(study0?.title).toContain('Opera Game');
    expect(study0?.moves.length).toBeGreaterThan(2);
  });

  it('converts PGN into valid CustomPuzzleInput structure', () => {
    const pgn = `[Event "Simulated Clash"]
[FEN "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3"]

3. Bb5 a6 4. Ba4`;

    const puzzle = convertPgnToCustomPuzzle(pgn, 'Custom Match', ['f1b5']);
    expect(puzzle.title).toBe('Custom Match');
    expect(puzzle.fen).toContain('r1bqkbnr');
    expect(puzzle.moves).toEqual(['f1b5']);
  });
});
