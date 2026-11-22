import { performFairCoinToss } from './coin-toss';

describe('performFairCoinToss', () => {
  const players = ['player-alpha', 'player-beta'];

  it('honors an explicit firstPlayer if present in player list', () => {
    const result = performFairCoinToss(players, 'player-beta');
    expect(result.firstPlayerId).toBe('player-beta');
    expect(result.firstTurnIndex).toBe(1);
    expect(result.toss).toBe('heads');
    expect(result.seed).toBeDefined();
  });

  it('produces statistically unbiased 50/50 starting turn assignment', () => {
    let playerAlphaCount = 0;
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      const result = performFairCoinToss(players);
      expect(['heads', 'tails']).toContain(result.toss);
      expect([0, 1]).toContain(result.firstTurnIndex);
      expect(players).toContain(result.firstPlayerId);

      if (result.firstPlayerId === 'player-alpha') {
        playerAlphaCount++;
      }
    }

    const ratio = playerAlphaCount / iterations;
    expect(ratio).toBeGreaterThan(0.42);
    expect(ratio).toBeLessThan(0.58);
  });

  it('handles random string argument as unbiased toss', () => {
    const result = performFairCoinToss(players, 'random');
    expect(players).toContain(result.firstPlayerId);
    expect([0, 1]).toContain(result.firstTurnIndex);
  });
});
