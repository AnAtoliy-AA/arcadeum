import { DeltaCompressor } from './delta-compressor';

describe('DeltaCompressor', () => {
  it('generates full snapshot when previous state is null', () => {
    const state = {
      turn: 1,
      board: ['X', null, 'O'],
      score: { p1: 10, p2: 5 },
    };
    const delta = DeltaCompressor.generateDelta(null, state, 1);

    expect(delta.isFullSnapshot).toBe(true);
    expect(delta.snapshot).toEqual(state);
    expect(delta.sequenceId).toBe(1);
  });

  it('generates compact diff when state changes incrementally', () => {
    const prevState = {
      turn: 1,
      board: ['X', null, null],
      score: { p1: 10, p2: 5 },
    };
    const nextState = {
      turn: 2,
      board: ['X', 'O', null],
      score: { p1: 10, p2: 5 },
    };

    const delta = DeltaCompressor.generateDelta(prevState, nextState, 2);

    expect(delta.isFullSnapshot).toBe(false);
    expect(delta.diff).toEqual({
      turn: 2,
      board: ['X', 'O', null],
    });
  });

  it('correctly applies delta to reconstruct next state', () => {
    const prevState = {
      turn: 1,
      players: {
        p1: { name: 'Alice', hp: 100 },
        p2: { name: 'Bob', hp: 80 },
      },
    };
    const nextState = {
      turn: 2,
      players: {
        p1: { name: 'Alice', hp: 100 },
        p2: { name: 'Bob', hp: 65 },
      },
    };

    const delta = DeltaCompressor.generateDelta(prevState, nextState, 2);
    const reconstructed = DeltaCompressor.applyDelta(prevState, delta);

    expect(reconstructed).toEqual(nextState);
  });

  it('handles field deletions', () => {
    const prevState: Record<string, unknown> = {
      turn: 1,
      tempFlag: true,
      status: 'active',
    };
    const nextState: Record<string, unknown> = { turn: 2, status: 'active' };

    const delta = DeltaCompressor.generateDelta(prevState, nextState, 2);
    const reconstructed = DeltaCompressor.applyDelta(prevState, delta);

    expect(reconstructed).toEqual(nextState);
    expect(reconstructed.tempFlag).toBeUndefined();
  });

  it('throws when applying delta to mismatched base state checksum', () => {
    const stateA = { turn: 1, score: 10 };
    const stateB = { turn: 2, score: 20 };
    const stateC = { turn: 99, score: 999 };

    const delta = DeltaCompressor.generateDelta(stateA, stateB, 2);

    expect(() => DeltaCompressor.applyDelta(stateC, delta)).toThrow(
      /Checksum mismatch/,
    );
  });
});
