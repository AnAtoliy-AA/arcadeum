import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { UserDailyReward } from './schemas/user-daily-reward.schema';
import { DailyRewardAlreadyClaimedError } from './daily-rewards.errors';
import { nextStreak, rewardKeyForStreak, todayUtc } from './streak';
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
  /** ISO timestamp of the next UTC midnight — when canClaim flips back. */
  nextResetAt: string;
}

/**
 * Result of a successful claim. Mirrors what the controller returns to the
 * web client; balance comes from the wallet credit so the client can update
 * the header without an extra round trip.
 */
export interface DailyRewardClaimResult {
  awardedCoins: number;
  currentStreak: number;
  balanceAfter: number;
}

interface UserDailyRewardLean {
  userId: Types.ObjectId;
  lastClaimedDay: string;
  currentStreak: number;
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
    const canClaim = lastDay !== today;

    // When canClaim is false, nextDay represents what *would* be awarded if
    // the user could claim today — exposed mainly so the UI can render the
    // already-claimed stamp consistently.
    const nextDay = canClaim
      ? nextStreak(streak, lastDay, today)
      : Math.max(1, streak);

    const nextRewardCoins = await this.economy.getNumber(
      rewardKeyForStreak(nextDay),
    );

    return {
      canClaim,
      nextDay,
      currentStreak: streak,
      nextRewardCoins,
      nextResetAt: nextUtcMidnight(today),
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
      const newStreak = nextStreak(prevStreak, prevDay, today);
      const key = rewardKeyForStreak(newStreak);
      const amount = await this.economy.getNumber(key);

      // Credit the wallet first inside the same session so that if it
      // throws (insufficient funds for debit is impossible here, but other
      // failures are) we abort the transaction and the user-daily-reward
      // doc is never persisted.
      const tx = await this.wallet.credit(
        userId,
        'coins',
        amount,
        'daily_reward',
        `${userId}:${today}`,
        { streakDay: newStreak },
        session,
      );

      await this.model.findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        {
          $set: {
            userId: new Types.ObjectId(userId),
            lastClaimedDay: today,
            currentStreak: newStreak,
          },
        },
        { upsert: true, new: true, session },
      );

      return {
        awardedCoins: amount,
        currentStreak: newStreak,
        balanceAfter: tx.balanceAfter,
      };
    });
  }

  private async withSession<T>(
    parent: ClientSession | undefined,
    fn: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    if (parent) {
      return fn(parent);
    }
    const own = await this.connection.startSession();
    try {
      let result!: T;
      await own.withTransaction(async () => {
        result = await fn(own);
      });
      return result;
    } finally {
      await own.endSession();
    }
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
