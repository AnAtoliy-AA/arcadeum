import { isLegalPuzzleLine, isPuzzleSolved } from './chess-puzzle-solution';

// Scholar's mate pattern: white to play Qxf7#.
const MATE_IN_ONE =
  'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4';
// Back rank: both Ra8# and Rb8# mate.
const TWO_MATES = '7k/6pp/8/8/8/8/1R6/R5K1 w - - 0 1';
// Quiet three-ply line used to test both submission formats.
const LINE_FEN = '6k1/5ppp/8/8/8/8/5PPP/1R4K1 w - - 0 1';
const LINE = ['g1f1', 'g8f8', 'b1b8'];

describe('isPuzzleSolved', () => {
  it('accepts the solution as player-only moves (web format)', () => {
    expect(isPuzzleSolved(MATE_IN_ONE, ['h5f7'], ['h5f7'])).toBe(true);
    expect(isPuzzleSolved(LINE_FEN, LINE, ['g1f1', 'b1b8'])).toBe(true);
  });

  it('accepts the full line including opponent replies', () => {
    expect(isPuzzleSolved(LINE_FEN, LINE, LINE)).toBe(true);
  });

  it('accepts an alternative checkmate', () => {
    expect(isPuzzleSolved(TWO_MATES, ['a1a8'], ['b2b8'])).toBe(true);
  });

  it('rejects a wrong move that does not mate', () => {
    expect(isPuzzleSolved(TWO_MATES, ['a1a8'], ['b2b7'])).toBe(false);
    expect(isPuzzleSolved(LINE_FEN, LINE, ['g1h1', 'b1b8'])).toBe(false);
  });

  it('rejects illegal or malformed moves and bad FENs', () => {
    expect(isPuzzleSolved(TWO_MATES, ['a1a8'], ['a1h8'])).toBe(false);
    expect(isPuzzleSolved(TWO_MATES, ['a1a8'], ['zz99'])).toBe(false);
    expect(isPuzzleSolved('not a fen', ['a1a8'], ['a1a8'])).toBe(false);
  });

  it('rejects an incomplete or empty solution', () => {
    expect(isPuzzleSolved(LINE_FEN, LINE, ['g1f1'])).toBe(false);
    expect(isPuzzleSolved(LINE_FEN, LINE, [])).toBe(false);
  });

  it('tolerates a missing queen promotion letter', () => {
    const fen = '7k/P7/8/8/8/8/8/K7 w - - 0 1';
    expect(isPuzzleSolved(fen, ['a7a8q'], ['a7a8'])).toBe(true);
    expect(isPuzzleSolved(fen, ['a7a8q'], ['a7a8n'])).toBe(false);
  });
});

describe('isLegalPuzzleLine', () => {
  it('accepts a legal line and rejects an illegal one', () => {
    expect(isLegalPuzzleLine(LINE_FEN, LINE)).toBe(true);
    expect(isLegalPuzzleLine(TWO_MATES, ['a1a8', 'h8h7'])).toBe(false);
    expect(isLegalPuzzleLine(TWO_MATES, [])).toBe(false);
  });
});
