import { BadRequestException } from '@nestjs/common';
import { BattlePassService } from './battle-pass.service';
import { CURRENT_SEASON } from './battle-pass.constants';

type Lean<T> = { lean: () => Promise<T> };

function leanChain<T>(value: T): { select: () => Lean<T> } & Lean<T> {
  const chain = {
    select: () => chain,
    lean: () => Promise.resolve(value),
  };
  return chain;
}

describe('BattlePassService', () => {
  function build(opts: {
    role?: string;
    xp?: number;
    claimedTiers?: number[];
  }) {
    const userModel = {
      findById: jest.fn(() =>
        leanChain({ role: opts.role ?? 'free', xp: opts.xp ?? 0 }),
      ),
      bulkWrite: jest.fn(() => Promise.resolve({})),
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
    const wallet = { credit: jest.fn(() => Promise.resolve({})) };
    const inventory = { grant: jest.fn(() => Promise.resolve()) };
    type Args = ConstructorParameters<typeof BattlePassService>;
    const service = new BattlePassService(
      progressModel as unknown as Args[0],
      userModel as unknown as Args[1],
      wallet as unknown as Args[2],
      inventory as unknown as Args[3],
    );
    return { service, userModel, progressModel, wallet, inventory };
  }

  it('reads xp from user document, derives current tier and premium flag', async () => {
    // 1300 xp → tier 5 (1200) unlocked, 6 (1800) not.
    const { service } = build({
      role: 'vip',
      xp: 1300,
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
    const { service } = build({ role: 'free', xp: 0 });
    const state = await service.getState('user-1');
    expect(state.isPremium).toBe(false);
    expect(state.currentTier).toBe(1); // tier 1 is xp 0
  });

  it('rejects claiming a locked tier', async () => {
    const { service } = build({ xp: 0 });
    await expect(service.claim('user-1', 8)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects an unknown tier', async () => {
    const { service } = build({ xp: 99999 });
    await expect(service.claim('user-1', 999)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('claims an unlocked tier, credits currency and grants the premium cosmetic', async () => {
    // High xp → all tiers unlocked. Tier 3: free = coins, premium = cosmetic.
    const { service, progressModel, wallet, inventory } = build({
      role: 'premium',
      xp: 50000,
    });
    const result = await service.claim('user-1', 3);
    expect(progressModel.findOneAndUpdate).toHaveBeenCalled();
    expect(result.tier).toBe(3);
    expect(result.claimedTiers).toContain(3);
    expect(result.rewards).toHaveLength(2); // free + premium

    // Free coins credited with a deterministic idempotency key.
    expect(wallet.credit).toHaveBeenCalledWith(
      'user-1',
      'coins',
      expect.any(Number),
      'battle_pass_reward',
      'bp:season-1:3:free:user-1',
      expect.any(Object),
    );
    // Premium cosmetic granted.
    expect(inventory.grant).toHaveBeenCalledWith(
      'user-1',
      'frame-prism',
      'bp:season-1:3:premium:user-1',
    );
  });

  it('credits only the free reward for non-premium users', async () => {
    const { service, wallet, inventory } = build({
      role: 'free',
      xp: 50000,
    });
    const result = await service.claim('user-1', 3);
    expect(result.rewards).toHaveLength(1);
    expect(wallet.credit).toHaveBeenCalledTimes(1);
    expect(inventory.grant).not.toHaveBeenCalled();
  });

  it('does not pay out again when the tier is already claimed', async () => {
    const { service, wallet, inventory, progressModel } = build({
      role: 'premium',
      xp: 50000,
      claimedTiers: [3],
    });
    const result = await service.claim('user-1', 3);
    expect(result.claimedTiers).toEqual([3]);
    expect(wallet.credit).not.toHaveBeenCalled();
    expect(inventory.grant).not.toHaveBeenCalled();
    expect(progressModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('awards XP to players after a game', async () => {
    const { service, userModel } = build({ xp: 100 });
    await service.awardGameXp(['user-1', 'user-2'], ['user-1']);
    expect(userModel.bulkWrite).toHaveBeenCalledWith([
      {
        updateOne: {
          filter: { _id: 'user-1' },
          update: { $inc: { xp: 50 } }, // 10 base + 40 win bonus
        },
      },
      {
        updateOne: {
          filter: { _id: 'user-2' },
          update: { $inc: { xp: 10 } }, // 10 base only (loss)
        },
      },
    ]);
  });

  it('skips bot players when awarding XP', async () => {
    const { service, userModel } = build({ xp: 0 });
    await service.awardGameXp(['user-1', 'bot-abc'], ['user-1']);
    expect(userModel.bulkWrite).toHaveBeenCalledWith([
      {
        updateOne: {
          filter: { _id: 'user-1' },
          update: { $inc: { xp: 50 } },
        },
      },
    ]);
  });
});
