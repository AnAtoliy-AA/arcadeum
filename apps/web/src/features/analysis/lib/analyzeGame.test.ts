import { describe, it, expect } from 'vitest';
import { analyzeGame } from './analyzeGame';
import { evaluateFen } from './position-evaluator';

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
const AFTER_E4 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR';
// White blundered the queen (d1 removed) but still pushed e4.
const WHITE_BLUNDERED_QUEEN = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNB1KBNR';
// Black then hung its own queen (d8 removed) — both queens off.
const BOTH_QUEENS_OFF = 'rnb1kbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNB1KBNR';

describe('analyzeGame', () => {
  it('returns empty analysis for empty or single-position history', () => {
    const empty = analyzeGame([]);
    expect(empty.evals).toEqual([]);
    expect(empty.moves).toEqual([]);
    expect(empty.turningPoint).toBeNull();
    expect(empty.finalEval).toBe(0);

    const single = analyzeGame([START]);
    expect(single.evals).toHaveLength(1);
    expect(single.moves).toEqual([]);
    expect(single.turningPoint).toBeNull();
  });

  it('computes one assessment per move with correct colors and move numbers', () => {
    const analysis = analyzeGame([START, AFTER_E4, WHITE_BLUNDERED_QUEEN]);
    expect(analysis.evals).toHaveLength(3);
    expect(analysis.moves).toHaveLength(2);

    const [whiteMove, blackMove] = analysis.moves;
    expect(whiteMove.color).toBe('white');
    expect(whiteMove.moveNumber).toBe(1);
    expect(whiteMove.ply).toBe(0);
    expect(blackMove.color).toBe('black');
    expect(blackMove.moveNumber).toBe(1);
    expect(blackMove.ply).toBe(1);
  });

  it('flags a queen blunder as a blunder with a ~900cp loss', () => {
    const analysis = analyzeGame([START, WHITE_BLUNDERED_QUEEN]);
    const [move] = analysis.moves;

    expect(move.quality).toBe('blunder');
    expect(move.loss).toBeGreaterThan(800);
    expect(analysis.blunders).toHaveLength(1);
    expect(analysis.blunders[0].ply).toBe(0);
    expect(analysis.turningPoint?.ply).toBe(0);
  });

  it('flags a blunder from the other side too', () => {
    const analysis = analyzeGame([
      START,
      WHITE_BLUNDERED_QUEEN,
      BOTH_QUEENS_OFF,
    ]);
    const [whiteMove, blackMove] = analysis.moves;

    expect(whiteMove.quality).toBe('blunder');
    expect(whiteMove.loss).toBeGreaterThan(800);
    expect(blackMove.quality).toBe('blunder');
    expect(blackMove.loss).toBeGreaterThan(800);
    expect(analysis.blunders).toHaveLength(2);
  });

  it('grades a small swing as good', () => {
    const analysis = analyzeGame([START, AFTER_E4]);
    expect(analysis.moves[0].quality).toBe('good');
    expect(analysis.moves[0].loss).toBeLessThanOrEqual(50);
  });

  it('attaches provided notations to moves', () => {
    const analysis = analyzeGame(
      [START, AFTER_E4, WHITE_BLUNDERED_QUEEN],
      ['e4', 'Qxd1'],
    );
    expect(analysis.moves[0].notation).toBe('e4');
    expect(analysis.moves[1].notation).toBe('Qxd1');
  });

  it('is consistent with the raw evaluator', () => {
    const history = [START, AFTER_E4];
    const analysis = analyzeGame(history);
    expect(analysis.evals[0]).toBe(evaluateFen(START));
    expect(analysis.evals[1]).toBe(evaluateFen(AFTER_E4));
    expect(analysis.finalEval).toBe(analysis.evals[1]);
  });
});
