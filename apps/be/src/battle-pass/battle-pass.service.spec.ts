import { BadRequestException } from '@nestjs/common';
import { BattlePassService } from './battle-pass.service';
import { CURRENT_SEASON } from './battle-pass.constants';

type Lean<T> = { lean: () => Promise<T> };

function leanChain<T>(value: T): { select: () => Lean<T> } & Lean<T> {
  const chain = {
    select: () => chain,
    lean: () => Promise.resolve(value),
  };
  return chain as unknown as { select: () => Lean<T> } & Lean<T>;
}

describe('BattlePassService', () => {
  function build(opts: {
    role?: string;
    totalGames?: number;
    wins?: number;
    claimedTiers?: number[];
  }) {
    const userModel = {
      findById: jest.fn(() => leanChain({ role: opts.role ?? 'free' })),
    };
    const progressModel = {
      findOne: jest.fn(() =>
        leanChain(
          opts.claimedTiers ? { claimedTiers: opts.claimedTiers } : null,
        ),
      ),
      findOneAndUpdate: jest.fn(() =>
        leanChain({ claimedTiers: [...(opts.claimedTiers ?? []), 3] }),
      ),
    };
    const stats = {
      getPlayerStats: jest.fn(() =>
        Promise.resolve({
          totalGames: opts.totalGames ?? 0,
          wins: opts.wins ?? 0,
          losses: 0,
          winRate: 0,
          byGameType: [],
        }),
      ),
    };
    type Args = ConstructorParameters<typeof BattlePassService>;
    const service = new BattlePassService(
      progressModel as unknown as Args[0],
      userModel as unknown as Args[1],
      stats as unknown as Args[2],
    );
    return { service, userModel, progressModel, stats };
  }

  it('derives xp, current tier and premium flag', async () => {
    // 50 games, 20 wins → 500 + 800 = 1300 xp → tier 5 (1200) unlocked, 6 (1800) not.
    const { service } = build({
      role: 'vip',
      totalGames: 50,
      wins: 20,
      claimedTiers: [1, 2],
    });
    const state = await service.getState('user-1');
    expect(state.xp).toBe(1300);
    expect(state.currentTier).toBe(5);
    expect(state.isPremium).toBe(true);
    expect(state.claimedTiers).toEqual([1, 2]);
    expect(state.season.id).toBe(CURRENT_SEASON.id);
  });

  it('treats non-prestige roles as non-premium', async () => {
    const { service } = build({ role: 'free', totalGames: 0, wins: 0 });
    const state = await service.getState('user-1');
    expect(state.isPremium).toBe(false);
    expect(state.currentTier).toBe(1); // tier 1 is xp 0
  });

  it('rejects claiming a locked tier', async () => {
    const { service } = build({ totalGames: 0, wins: 0 }); // xp 0
    await expect(service.claim('user-1', 8)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects an unknown tier', async () => {
    const { service } = build({ totalGames: 100, wins: 100 });
    await expect(service.claim('user-1', 999)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('claims an unlocked tier and returns premium rewards for prestige users', async () => {
    // High stats → all tiers unlocked.
    const { service, progressModel } = build({
      role: 'premium',
      totalGames: 500,
      wins: 400,
    });
    const result = await service.claim('user-1', 3);
    expect(progressModel.findOneAndUpdate).toHaveBeenCalled();
    expect(result.tier).toBe(3);
    expect(result.claimedTiers).toContain(3);
    // Free + premium reward for a premium user.
    expect(result.rewards).toHaveLength(2);
  });

  it('returns only the free reward for non-premium users', async () => {
    const { service } = build({ role: 'free', totalGames: 500, wins: 400 });
    const result = await service.claim('user-1', 3);
    expect(result.rewards).toHaveLength(1);
  });
});
