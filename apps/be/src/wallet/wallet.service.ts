import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import {
  WalletTransaction,
  WalletTransactionDocument,
} from './schemas/wallet-transaction.schema';
import type { WalletCurrency, WalletReason } from './interfaces/wallet-types';
import type { WalletBalance } from './interfaces/wallet-balance.interface';
import type {
  WalletTransactionView,
  PaginatedWalletTransactions,
} from './interfaces/wallet-transaction.interface';
import { InsufficientFundsException } from './exceptions/insufficient-funds.exception';
import { InvalidCurrencyException } from './exceptions/invalid-currency.exception';
import { WalletGateway } from './wallet.gateway';

type UserBalanceFields = { coins: number; gems: number };

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  public static readonly MAX_TRANSACTION_AMOUNT = 1_000_000;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(WalletTransaction.name)
    private readonly txModel: Model<WalletTransactionDocument>,
    @Inject(forwardRef(() => WalletGateway))
    private readonly gateway: WalletGateway,
  ) {}

  async credit(
    userId: string,
    currency: WalletCurrency,
    amount: number,
    reason: WalletReason,
    idempotencyKey: string,
    metadata?: Record<string, unknown>,
    parentSession?: ClientSession,
  ): Promise<WalletTransactionView> {
    this.assertPositiveInteger(amount);
    this.assertCurrency(currency);
    try {
      return await this.withSession(parentSession, async (session, isOwn) =>
        this.doWrite(session, isOwn, {
          userId,
          currency,
          amount,
          reason,
          idempotencyKey,
          metadata,
          direction: 1,
        }),
      );
    } catch (err) {
      // Own-session path: recover from duplicate key by returning the prior tx.
      // Parent-session path: re-throw so the caller's transaction aborts.
      if (!parentSession && this.isDuplicateIdempotencyKey(err)) {
        const prior = await this.txModel.findOne({ idempotencyKey });
        if (prior) return this.toView(prior);
      }
      throw err;
    }
  }

  async debit(
    userId: string,
    currency: WalletCurrency,
    amount: number,
    reason: WalletReason,
    idempotencyKey: string,
    metadata?: Record<string, unknown>,
    parentSession?: ClientSession,
  ): Promise<WalletTransactionView> {
    this.assertPositiveInteger(amount);
    this.assertCurrency(currency);
    try {
      return await this.withSession(parentSession, async (session, isOwn) =>
        this.doWrite(session, isOwn, {
          userId,
          currency,
          amount,
          reason,
          idempotencyKey,
          metadata,
          direction: -1,
        }),
      );
    } catch (err) {
      // Own-session path: recover from duplicate key by returning the prior tx.
      // Parent-session path: re-throw so the caller's transaction aborts.
      if (!parentSession && this.isDuplicateIdempotencyKey(err)) {
        const prior = await this.txModel.findOne({ idempotencyKey });
        if (prior) return this.toView(prior);
      }
      throw err;
    }
  }

  async getBalance(userId: string): Promise<WalletBalance> {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('wallet.userNotFound');
    const balances = user as unknown as UserBalanceFields;
    return {
      coins: balances.coins ?? 0,
      gems: balances.gems ?? 0,
    };
  }

  async getHistory(
    userId: string,
    opts: { currency?: WalletCurrency; cursor?: string; limit?: number },
  ): Promise<PaginatedWalletTransactions> {
    const limit = Math.min(Math.max(opts.limit ?? 20, 1), 100);
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (opts.currency) filter.currency = opts.currency;

    if (opts.cursor) {
      const decoded = this.decodeCursor(opts.cursor);
      filter.$or = [
        { createdAt: { $lt: decoded.createdAt } },
        {
          createdAt: decoded.createdAt,
          _id: { $lt: decoded._id },
        },
      ];
    }

    const docs = await this.txModel
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = docs.length > limit;
    const items = (hasMore ? docs.slice(0, limit) : docs).map((d) =>
      this.toView(d as unknown as WalletTransactionDocument),
    );
    const nextCursor = hasMore
      ? this.encodeCursor(
          new Date(items[items.length - 1].createdAt),
          new Types.ObjectId(items[items.length - 1].id),
        )
      : null;

    return { items, nextCursor };
  }

  async findByIdempotencyKey(
    key: string,
  ): Promise<WalletTransactionView | null> {
    const doc = await this.txModel.findOne({ idempotencyKey: key });
    return doc ? this.toView(doc) : null;
  }

  emitAfterCommit(userId: string, balance: WalletBalance): void {
    this.gateway.emitBalance(userId, balance);
  }

  private async withSession<T>(
    parentSession: ClientSession | undefined,
    fn: (session: ClientSession, isOwn: boolean) => Promise<T>,
  ): Promise<T> {
    if (parentSession) {
      return fn(parentSession, false);
    }
    const ownSession = await this.connection.startSession();
    try {
      let result!: T;
      await ownSession.withTransaction(async () => {
        result = await fn(ownSession, true);
      });
      return result;
    } finally {
      await ownSession.endSession();
    }
  }

  private async doWrite(
    session: ClientSession,
    isOwnSession: boolean,
    args: {
      userId: string;
      currency: WalletCurrency;
      amount: number;
      reason: WalletReason;
      idempotencyKey: string;
      metadata?: Record<string, unknown>;
      direction: 1 | -1;
    },
  ): Promise<WalletTransactionView> {
    const {
      userId,
      currency,
      amount,
      reason,
      idempotencyKey,
      metadata,
      direction,
    } = args;

    const filter: Record<string, unknown> = { _id: new Types.ObjectId(userId) };
    if (direction === -1) filter[currency] = { $gte: amount };

    let createdTx: WalletTransactionDocument | null = null;
    let lastBalance: WalletBalance | null = null;

    const user = await this.userModel.findOneAndUpdate(
      filter,
      { $inc: { [currency]: direction * amount } },
      { new: true, session },
    );

    if (!user) {
      if (direction === -1) {
        const current = await this.userModel
          .findById(userId, null, { session })
          .lean();
        const available = current
          ? this.pickBalance(current as unknown as UserBalanceFields, currency)
          : 0;
        throw new InsufficientFundsException(currency, amount, available);
      }
      throw new NotFoundException('wallet.userNotFound');
    }

    const balanceFields = user as unknown as UserBalanceFields;
    lastBalance = { coins: balanceFields.coins, gems: balanceFields.gems };

    const docs = await this.txModel.create(
      [
        {
          userId: new Types.ObjectId(userId),
          currency,
          delta: direction * amount,
          balanceAfter: this.pickBalance(balanceFields, currency),
          reason,
          idempotencyKey,
          metadata,
        },
      ],
      { session },
    );
    createdTx = docs[0];

    if (!createdTx || !lastBalance) {
      throw new InternalServerErrorException('wallet.transactionFailed');
    }

    // Emit only after the transaction is durably committed. Inside a parent
    // session we don't know if the parent will commit, so defer to the caller.
    if (isOwnSession) {
      this.gateway.emitBalance(userId, lastBalance);
    }

    return this.toView(createdTx);
  }

  private pickBalance(
    obj: UserBalanceFields,
    currency: WalletCurrency,
  ): number {
    return obj[currency] ?? 0;
  }

  private assertPositiveInteger(amount: number): void {
    if (
      !Number.isInteger(amount) ||
      amount <= 0 ||
      amount > WalletService.MAX_TRANSACTION_AMOUNT
    ) {
      throw new BadRequestException('wallet.invalidAmount');
    }
  }

  private assertCurrency(currency: string): void {
    if (currency !== 'coins' && currency !== 'gems') {
      throw new InvalidCurrencyException(currency);
    }
  }

  private isDuplicateIdempotencyKey(err: unknown): boolean {
    const e = err as { code?: number; keyPattern?: Record<string, number> };
    return e?.code === 11000 && Boolean(e?.keyPattern?.idempotencyKey);
  }

  private toView(doc: WalletTransactionDocument): WalletTransactionView {
    type RawTx = WalletTransaction & { _id: Types.ObjectId; createdAt: Date };
    const obj = (doc.toObject ? doc.toObject() : doc) as unknown as RawTx;
    return {
      id: String(obj._id),
      currency: obj.currency,
      delta: obj.delta,
      balanceAfter: obj.balanceAfter,
      reason: obj.reason,
      metadata: obj.metadata,
      createdAt: obj.createdAt.toISOString(),
    };
  }

  private encodeCursor(createdAt: Date, id: Types.ObjectId): string {
    return Buffer.from(
      `${createdAt.getTime()}:${id.toHexString()}`,
      'utf8',
    ).toString('base64url');
  }

  private decodeCursor(cursor: string): {
    createdAt: Date;
    _id: Types.ObjectId;
  } {
    try {
      const [ms, id] = Buffer.from(cursor, 'base64url')
        .toString('utf8')
        .split(':');
      return {
        createdAt: new Date(Number(ms)),
        _id: new Types.ObjectId(id),
      };
    } catch {
      throw new BadRequestException('wallet.invalidCursor');
    }
  }
}
