import { runInTransaction } from '../common/utils/transaction.util';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { UserDailyReward } from './schemas/user-daily-reward.schema';
import { DailyRewardAlreadyClaimedError } from './daily-rewards.errors';
import {
  isYesterday,
  nextStreak,
  rewardKeyForStreak,
  todayUtc,
} from './streak';
import { WalletService } from '../wallet/wallet.service';
import { EconomySettingsService } from '../economy/economy-settings.service';

/**
 * Snapshot of a user's daily-rewards state used to render the claim UI.
 */
export interface DailyRewardStatus {
  /** True iff the user has not yet claimed today (UTC). */
  canClaim: boolean;
  /** The streak day (1..7) that the next successful claim will award. */
  nextDay: number;
  /** Streak day of the user's most recent successful claim. 0 if none. */
  currentStreak: number;
  /** Coin amount the next claim will pay out (snapshot of the economy key). */
  nextRewardCoins: number;
  /** Gem amount the next claim will pay out. Only > 0 on Day 7. */
  nextRewardGems: number;
  /** ISO timestamp of the next UTC midnight — when canClaim flips back. */
  nextResetAt: string;
  /** Number of streak freeze tokens the user holds. */
  freezeTokens: number;
  /** True iff the streak would reset today but a freeze token can save it. */
  canUseFreeze: boolean;
}

/**
 * Result of a successful claim. Mirrors what the controller returns to the
 * web client; balance comes from the wallet credit so the client can update
 * the header without an extra round trip.
 */
export interface DailyRewardClaimResult {
  awardedCoins: number;
  awardedGems: number;
  currentStreak: number;
  coinsBalanceAfter: number;
  /** Only populated when awardedGems > 0; null otherwise. */
  gemsBalanceAfter: number | null;
}

interface UserDailyRewardLean {
  userId: Types.ObjectId;
  lastClaimedDay: string;
  currentStreak: number;
  freezeTokens: number;
}

@Injectable()
export class DailyRewardsService {
  private readonly logger = new Logger(DailyRewardsService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(UserDailyReward.name)
    private readonly model: Model<UserDailyReward>,
    private readonly wallet: WalletService,
    private readonly economy: EconomySettingsService,
  ) {}

  async getStatus(userId: string): Promise<DailyRewardStatus> {
    const today = todayUtc(new Date());
    const doc = await this.model
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean<UserDailyRewardLean | null>();

    const lastDay = doc?.lastClaimedDay ?? null;
    const streak = doc?.currentStreak ?? 0;
    const freezeTokens = doc?.freezeTokens ?? 0;
    const canClaim = lastDay !== today;

    // When canClaim is false, nextDay represents what *would* be awarded if
    // the user could claim today — exposed mainly so the UI can render the
    // already-claimed stamp consistently.
    const nextDay = canClaim
      ? nextStreak(streak, lastDay, today, freezeTokens).streak
      : Math.max(1, streak);

    const nextRewardCoins = await this.economy.getNumber(
      rewardKeyForStreak(nextDay),
    );
    const nextRewardGems =
      nextDay === 7
        ? await this.economy.getNumber('daily_reward_day_7_bonus_gems')
        : 0;

    // canUseFreeze: streak would reset but user has freeze tokens
    const wouldReset =
      canClaim && lastDay !== null && !isYesterday(lastDay, today);
    const canUseFreeze = canClaim && wouldReset && freezeTokens > 0;

    return {
      canClaim,
      nextDay,
      currentStreak: streak,
      nextRewardCoins,
      nextRewardGems,
      nextResetAt: nextUtcMidnight(today),
      freezeTokens,
      canUseFreeze,
    };
  }

  async claim(
    userId: string,
    parentSession?: ClientSession,
  ): Promise<DailyRewardClaimResult> {
    const today = todayUtc(new Date());

    return this.withSession(parentSession, async (session) => {
      // Re-read inside the session so concurrent claims race on the same
      // snapshot. The unique index on userId + the same-day guard below
      // form the safety net against double-claim from parallel requests.
      const doc = await this.model
        .findOne({ userId: new Types.ObjectId(userId) }, null, { session })
        .lean<UserDailyRewardLean | null>();

      if (doc?.lastClaimedDay === today) {
        throw new DailyRewardAlreadyClaimedError(userId, today);
      }

      const prevStreak = doc?.currentStreak ?? 0;
      const prevDay = doc?.lastClaimedDay ?? null;
      const freezeTokens = doc?.freezeTokens ?? 0;
      const { streak: newStreak, freezeUsed } = nextStreak(
        prevStreak,
        prevDay,
        today,
        freezeTokens,
      );
      const coinAmount = await this.economy.getNumber(
        rewardKeyForStreak(newStreak),
      );
      const gemAmount =
        newStreak === 7
          ? await this.economy.getNumber('daily_reward_day_7_bonus_gems')
          : 0;

      // Credit the wallet first inside the same session so that if it
      // throws we abort the transaction and the user-daily-reward doc is
      // never persisted. On Day 7 we also award gems via a separate
      // idempotency-keyed credit.
      const coinsTx = await this.wallet.credit(
        userId,
        'coins',
        coinAmount,
        'daily_reward',
        `${userId}:${today}`,
        { streakDay: newStreak },
        session,
      );

      let gemsBalanceAfter: number | null = null;
      if (gemAmount > 0) {
        const gemsTx = await this.wallet.credit(
          userId,
          'gems',
          gemAmount,
          'daily_reward',
          `${userId}:${today}:gems`,
          { streakDay: newStreak, bonus: true },
          session,
        );
        gemsBalanceAfter = gemsTx.balanceAfter;
      }

      const newFreezeTokens = freezeUsed ? freezeTokens - 1 : freezeTokens;

      await this.model.findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        {
          $set: {
            userId: new Types.ObjectId(userId),
            lastClaimedDay: today,
            currentStreak: newStreak,
            freezeTokens: newFreezeTokens,
          },
        },
        { upsert: true, new: true, session },
      );

      return {
        awardedCoins: coinAmount,
        awardedGems: gemAmount,
        currentStreak: newStreak,
        coinsBalanceAfter: coinsTx.balanceAfter,
        gemsBalanceAfter,
      };
    });
  }

  async buyFreezeTokens(
    userId: string,
    quantity: number,
  ): Promise<{ freezeTokens: number; coinsSpent: number }> {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error('buyFreezeTokens: quantity must be an integer in [1,10]');
    }

    const pricePerToken = await this.economy.getNumber(
      'streak_freeze_price_coins',
    );
    const totalCost = pricePerToken * quantity;

    return runInTransaction(this.connection, async (session) => {
      await this.wallet.debit(
        userId,
        'coins',
        totalCost,
        'streak_freeze_purchase',
        `freeze-buy-${userId}-${Date.now()}`,
        { quantity },
        session,
      );

      const doc = await this.model
        .findOneAndUpdate(
          { userId: new Types.ObjectId(userId) },
          {
            $inc: { freezeTokens: quantity },
            $setOnInsert: {
              userId: new Types.ObjectId(userId),
              lastClaimedDay: 'never',
              currentStreak: 0,
            },
          },
          { upsert: true, new: true, session },
        )
        .lean<UserDailyRewardLean>();

      return {
        freezeTokens: doc.freezeTokens,
        coinsSpent: totalCost,
      };
    });
  }

  private async withSession<T>(
    parent: ClientSession | undefined,
    fn: (session: ClientSession | undefined) => Promise<T>,
  ): Promise<T> {
    if (parent) {
      return fn(parent);
    }
    return runInTransaction(this.connection, fn);
  }
}

/**
 * Helper: given a UTC day string YYYY-MM-DD, return the ISO timestamp of the
 * next UTC midnight. Used by getStatus so the client can render a countdown.
 */
function nextUtcMidnight(today: string): string {
  const [y, m, d] = today.split('-').map(Number);
  // Date.UTC takes month as 0-indexed. We add one day.
  return new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0)).toISOString();
}
