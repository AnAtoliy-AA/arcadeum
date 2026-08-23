import { describe, expect, it } from 'vitest';
import { computeGameResult } from './computeGameResult';

describe('computeGameResult', () => {
  it('returns null while the game is in progress', () => {
    expect(computeGameResult(false, 'u1', { winnerId: 'u2' })).toBeNull();
    expect(computeGameResult(true, null, { winnerId: 'u2' })).toBeNull();
  });

  it('prefers the backend result when attached', () => {
    expect(
      computeGameResult(true, 'u1', {
        backendResult: { winnerIds: ['u2'], isDraw: false },
      }),
    ).toBe('lost');
    expect(
      computeGameResult(true, 'u1', {
        backendResult: { winnerIds: ['u1', 'u3'], isDraw: true },
      }),
    ).toBe('draw');
  });

  it('treats every co-winner as a win (multi-player forfeit)', () => {
    const options = { winnerIds: ['u0', 'u1', 'u3'] };
    expect(computeGameResult(true, 'u1', options)).toBe('won');
    expect(computeGameResult(true, 'u3', options)).toBe('won');
    expect(computeGameResult(true, 'u2', options)).toBe('lost');
    expect(computeGameResult(true, 'u0', { winnerIds: [] })).toBe('lost');
  });

  it('keeps the singular winnerId fallback for 1v1 games', () => {
    expect(computeGameResult(true, 'u1', { winnerId: 'u1' })).toBe('won');
    expect(computeGameResult(true, 'u1', { winnerId: 'u2' })).toBe('lost');
    expect(computeGameResult(true, 'u1', { isDraw: true })).toBe('draw');
  });
});
