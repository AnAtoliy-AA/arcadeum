/**
 * Wallet-touching helpers for TournamentsService.
 *
 * Extracted to keep tournaments.service.ts under 500 lines.
 * Each method opens its own Mongo session, runs the writes atomically, and
 * emits the post-commit balance via WalletService.emitAfterCommit.
 */
import { ConflictException } from '@nestjs/common';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import type { TournamentDocument } from '../schemas/tournament.schema';
import type { WalletService } from '../../wallet/wallet.service';

export interface RegistrationLeanForWallet {
  userId: Types.ObjectId;
  waitlist: boolean;
}

export interface TournamentLeanForWallet {
  _id: Types.ObjectId;
  entryFeeCoins: number;
  prizePoolCoins: number;
  registrations: RegistrationLeanForWallet[];
}

/** True when err is a MongoDB 11000 duplicate-key on the idempotencyKey field. */
export function looksLikeDuplicateKey(err: unknown): boolean {
  const e = err as { code?: number; keyPattern?: Record<string, number> };
  return e?.code === 11000 && Boolean(e?.keyPattern?.idempotencyKey);
}

export class TournamentWalletOps {
  constructor(
    private readonly connection: Connection,
    private readonly wallet: WalletService,
    private readonly model: Model<TournamentDocument>,
  ) {}

  /**
   * Atomically debits the entry fee and pushes the registration row.
   * When fee === 0 the wallet is not involved.
   */
  async chargeEntryFee(
    doc: TournamentLeanForWallet,
    userId: string,
    registrationPush: Record<string, unknown>,
  ): Promise<void> {
    const fee = doc.entryFeeCoins ?? 0;
    if (fee === 0) return;

    const tournamentId = doc._id.toHexString();
    const entryKey = `tournament-${tournamentId}-entry-${userId}`;

    const session: ClientSession = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        await this.wallet.debit(
          userId,
          'coins',
          fee,
          'tournament_entry',
          entryKey,
          { tournamentId },
          session,
        );
        await this.model.findByIdAndUpdate(
          doc._id,
          { $push: { registrations: registrationPush } },
          { session },
        );
      });
      const balance = await this.wallet.getBalance(userId);
      this.wallet.emitAfterCommit(userId, balance);
    } catch (err) {
      if (looksLikeDuplicateKey(err)) {
        const prior = await this.wallet.findByIdempotencyKey(entryKey);
        if (prior) return;
      }
      throw err;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Atomically refunds the entry fee and pulls the registration row.
   * When fee === 0 the wallet is not involved; the caller handles the $pull.
   */
  async refundEntryFee(
    doc: TournamentLeanForWallet,
    userId: string,
  ): Promise<boolean> {
    const fee = doc.entryFeeCoins ?? 0;
    if (fee === 0) return false;

    const tournamentId = doc._id.toHexString();
    const refundKey = `tournament-${tournamentId}-refund-${userId}`;
    const userOid = new Types.ObjectId(userId);

    const session: ClientSession = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        await this.wallet.credit(
          userId,
          'coins',
          fee,
          'tournament_refund',
          refundKey,
          { tournamentId },
          session,
        );
        await this.model.findByIdAndUpdate(
          doc._id,
          { $pull: { registrations: { userId: userOid } } },
          { session },
        );
      });
      const balance = await this.wallet.getBalance(userId);
      this.wallet.emitAfterCommit(userId, balance);
    } catch (err) {
      if (looksLikeDuplicateKey(err)) {
        const prior = await this.wallet.findByIdempotencyKey(refundKey);
        if (prior) return true;
      }
      throw err;
    } finally {
      await session.endSession();
    }

    return true;
  }

  /**
   * Cancels the tournament and refunds all paid (non-waitlist) registrations.
   * Uses a single Mongo session for the status update + all wallet credits.
   */
  async cancelWithRefunds(
    doc: TournamentLeanForWallet,
    $set: Record<string, unknown>,
  ): Promise<void> {
    const fee = doc.entryFeeCoins ?? 0;
    const paidRegs =
      fee > 0 ? doc.registrations.filter((r) => !r.waitlist) : [];

    if (paidRegs.length === 0) {
      await this.model.findByIdAndUpdate(doc._id, { $set });
      return;
    }

    const tournamentId = doc._id.toHexString();
    const session: ClientSession = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        await this.model.findByIdAndUpdate(doc._id, { $set }, { session });
        for (const reg of paidRegs) {
          const regUserId = reg.userId.toHexString();
          const refundKey = `tournament-${tournamentId}-refund-${regUserId}`;
          await this.wallet.credit(
            regUserId,
            'coins',
            fee,
            'tournament_refund',
            refundKey,
            { tournamentId, reason: 'admin_cancel' },
            session,
          );
        }
      });

      // Emit balance updates after commit for each refunded user.
      for (const reg of paidRegs) {
        const regUserId = reg.userId.toHexString();
        const balance = await this.wallet.getBalance(regUserId);
        this.wallet.emitAfterCommit(regUserId, balance);
      }
    } finally {
      await session.endSession();
    }
  }

  /**
   * Marks tournament completed, credits prize pool to winner.
   * Returns true when the update succeeded (modifiedCount === 1).
   * Throws ConflictException when status changed concurrently.
   */
  async markCompleteWithPrize(
    doc: TournamentLeanForWallet,
    winnerUserId: string,
  ): Promise<boolean> {
    const prize = doc.prizePoolCoins ?? 0;
    const tournamentId = doc._id.toHexString();
    const prizeKey = `tournament-${tournamentId}-prize-${winnerUserId}`;

    const session: ClientSession = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const result = await this.model.updateOne(
          { _id: doc._id, status: 'live' },
          { $set: { status: 'completed', winnerUserId } },
          { session },
        );
        if (result.modifiedCount === 0) {
          throw new ConflictException({ code: 'STATUS_CHANGED_CONCURRENTLY' });
        }
        if (prize > 0) {
          await this.wallet.credit(
            winnerUserId,
            'coins',
            prize,
            'tournament_prize',
            prizeKey,
            { tournamentId },
            session,
          );
        }
      });
      if (prize > 0) {
        const balance = await this.wallet.getBalance(winnerUserId);
        this.wallet.emitAfterCommit(winnerUserId, balance);
      }
    } catch (err) {
      if (looksLikeDuplicateKey(err)) {
        const prior = await this.wallet.findByIdempotencyKey(prizeKey);
        if (prior) return true;
      }
      throw err;
    } finally {
      await session.endSession();
    }

    return true;
  }
}
