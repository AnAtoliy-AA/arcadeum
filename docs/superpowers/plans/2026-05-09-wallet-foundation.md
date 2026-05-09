# ARC-615 — Wallet Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the dual-currency wallet foundation (`coins` + `gems`) for Arcadeum: schema, append-only ledger, internal `WalletService`, REST endpoints, real-time socket emit, web (Server Components + Server Actions) and mobile (TanStack Query) UI surfaces, admin grant/deduct, and full i18n + tests. No earn/spend automation, no real-money top-up — those live in ARC-616/617.

**Architecture:** New NestJS `WalletModule` is the **only** code allowed to mutate `coins`/`gems` or insert into the `WalletTransaction` ledger. Both balance and ledger live in Mongo; writes are wrapped in a Mongo transaction with a `$gte` conditional update for the debit guard, and idempotency is enforced by a unique index on `idempotencyKey`. A new `WalletGateway` emits `wallet:updated` to the user's own socket room on every successful mutation. Web data fetching uses Server Components and Server Actions for this feature only (intentional divergence from the project's TanStack Query default, scoped to wallet); mobile uses TanStack Query.

**Tech Stack:** NestJS, Mongoose, class-validator, socket.io (gateway), Next.js 15 App Router (Server Components + Server Actions), Tamagui via `@arcadeum/ui`, Expo Router, TanStack Query (mobile only), Vitest (web), Jest (BE + mobile), Playwright (e2e), ESLint `no-restricted-syntax`.

**Spec:** [docs/superpowers/specs/2026-05-09-wallet-foundation-design.md](../specs/2026-05-09-wallet-foundation-design.md)

---

## File structure

### Backend (`apps/be/src/`)

| Path                                                | Action | Responsibility                                                              |
| --------------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| `auth/schemas/user.schema.ts`                       | Modify | Add `coins` and `gems` `@Prop` fields.                                      |
| `wallet/wallet.module.ts`                           | Create | NestJS module wiring.                                                       |
| `wallet/wallet.service.ts`                          | Create | `credit` / `debit` / `getBalance` / `getHistory` + emit hook.               |
| `wallet/wallet.service.spec.ts`                     | Create | Unit tests for service.                                                     |
| `wallet/wallet.controller.ts`                       | Create | Player endpoints `/wallet/*`.                                               |
| `wallet/wallet.controller.spec.ts`                  | Create | Controller integration tests.                                               |
| `wallet/admin-wallet.controller.ts`                 | Create | Admin endpoints `/admin/wallet/*`.                                          |
| `wallet/admin-wallet.controller.spec.ts`            | Create | Admin controller integration tests.                                         |
| `wallet/wallet.gateway.ts`                          | Create | Socket gateway exposing `wallet:updated` emission.                          |
| `wallet/schemas/wallet-transaction.schema.ts`       | Create | Mongoose schema for the ledger collection.                                  |
| `wallet/dto/grant-wallet.dto.ts`                    | Create | Admin grant DTO.                                                            |
| `wallet/dto/deduct-wallet.dto.ts`                   | Create | Admin deduct DTO.                                                           |
| `wallet/dto/list-transactions.dto.ts`               | Create | Pagination + filter query DTO.                                              |
| `wallet/interfaces/wallet-balance.interface.ts`     | Create | `{ coins; gems }`.                                                          |
| `wallet/interfaces/wallet-transaction.interface.ts` | Create | Public-facing transaction shape (no `idempotencyKey`).                      |
| `wallet/interfaces/wallet-types.ts`                 | Create | `WalletCurrency` and `WalletReason` unions.                                 |
| `wallet/exceptions/insufficient-funds.exception.ts` | Create | Custom HTTP 422 exception.                                                  |
| `wallet/exceptions/invalid-currency.exception.ts`   | Create | Custom HTTP 400 exception.                                                  |
| `wallet/lib/wallet-bootstrap.ts`                    | Create | One-shot backfill helper called from `WalletModule.onApplicationBootstrap`. |
| `app.module.ts`                                     | Modify | Register `WalletModule`.                                                    |

### Backend ESLint

| Path                                     | Action | Responsibility                                                               |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------- |
| `apps/be/.eslintrc.cjs` (or equivalent)  | Modify | Add `no-restricted-syntax` rule banning direct `coins`/`gems` member access. |
| `apps/be/src/wallet/.eslintrc.cjs`       | Create | Override that disables the rule inside the wallet module.                    |
| `apps/web/.eslintrc.cjs` (or equivalent) | Modify | Same rule for web (no overrides — web should never mutate these).            |

### Web (`apps/web/src/`)

| Path                                                                    | Action | Responsibility                                                                   |
| ----------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| `features/wallet/server/wallet.server.ts`                               | Create | `getWalletBalance()`, `getWalletTransactions()` for Server Components.           |
| `features/wallet/server/wallet.types.ts`                                | Create | Shared TS types for FE.                                                          |
| `features/wallet/ui/BalanceChip.tsx`                                    | Create | Server Component showing both balances.                                          |
| `features/wallet/ui/WalletLiveBridge.tsx`                               | Create | `'use client'` island that listens on socket and calls `router.refresh()`.       |
| `features/wallet/ui/WalletPageView.tsx`                                 | Create | Server-rendered page body.                                                       |
| `features/wallet/ui/TransactionRow.tsx`                                 | Create | Row presentational component.                                                    |
| `features/wallet/lib/wallet-socket.ts`                                  | Create | Singleton `walletSocket` (matching `apps/web/src/shared/lib/socket.ts` pattern). |
| `app/[locale]/(authed)/wallet/page.tsx`                                 | Create | Wallet page shell (Server Component).                                            |
| `widgets/header/ui/HeaderInteractive.tsx`                               | Modify | Mount `<BalanceChip />` + `<WalletLiveBridge />`.                                |
| `features/admin-wallet/server/wallet.actions.ts`                        | Create | `grantWalletAction`, `deductWalletAction`, `loadAdminWalletAction`.              |
| `features/admin-wallet/ui/AdminWalletDrawer.tsx`                        | Create | Drawer client component.                                                         |
| `features/admin-wallet/ui/AdminWalletForm.tsx`                          | Create | Grant/deduct form.                                                               |
| `features/admin-users/ui/AdminUsersTable.tsx` (or row component)        | Modify | Add "Wallet" row action that opens the drawer.                                   |
| `shared/i18n/messages/pages/wallet/{en,ru,es,fr,by}.ts`                 | Create | 5 locale files for the player wallet page + chip + reasons.                      |
| `shared/i18n/messages/pages/admin-wallet/{en,ru,es,fr,by}.ts`           | Create | 5 locale files for the admin drawer.                                             |
| `shared/i18n/messages/pages/index.ts` (and the matching keyed registry) | Modify | Wire new namespaces.                                                             |

### Mobile (`apps/mobile/src/`)

Paths are illustrative; actual locations are confirmed via the `/new-mobile-screen` audit before writing.

| Path                                      | Action | Responsibility                                                     |
| ----------------------------------------- | ------ | ------------------------------------------------------------------ |
| `features/wallet/api/useWallet.ts`        | Create | TanStack Query hooks: `useWalletBalance`, `useWalletTransactions`. |
| `features/wallet/api/useWalletSocket.ts`  | Create | Subscribes to `wallet:updated` and invalidates queries.            |
| `features/wallet/ui/BalanceChip.tsx`      | Create | Mobile chip.                                                       |
| `features/wallet/ui/WalletScreenView.tsx` | Create | Screen body.                                                       |
| `app/(authed)/_layout.tsx` (existing)     | Modify | Mount `useWalletSocket()` once in the authed group.                |
| `app/(authed)/(tabs)/profile/wallet.tsx`  | Create | Expo Router screen.                                                |
| `<header component>`                      | Modify | Mount `<BalanceChip />`.                                           |
| `i18n/...wallet.ts` (5 locales)           | Create | Wallet keys.                                                       |

### E2E (`apps/web/e2e/` or wherever existing Playwright lives)

| Path                               | Action | Responsibility                             |
| ---------------------------------- | ------ | ------------------------------------------ |
| `e2e/wallet/admin-grant.spec.ts`   | Create | Admin grants → player chip + page reflect. |
| `e2e/wallet/wallet-page.spec.ts`   | Create | Filters + pagination.                      |
| `e2e/wallet/socket-update.spec.ts` | Create | Socket-driven `router.refresh()`.          |

---

## Phase 1 — Backend foundation: types, schemas, service

### Task 1 — Add wallet types

**Files:**

- Create: `apps/be/src/wallet/interfaces/wallet-types.ts`

- [ ] **Step 1: Create types file**

```ts
export const WALLET_CURRENCIES = ['coins', 'gems'] as const;
export type WalletCurrency = (typeof WALLET_CURRENCIES)[number];

export const WALLET_REASONS = ['admin_grant', 'admin_deduct'] as const;
export type WalletReason = (typeof WALLET_REASONS)[number];
```

- [ ] **Step 2: Commit**

```bash
git add apps/be/src/wallet/interfaces/wallet-types.ts
git commit -m "feat(wallet): add currency and reason type unions (ARC-615)"
```

### Task 2 — Add `coins` / `gems` to User schema

**Files:**

- Modify: `apps/be/src/auth/schemas/user.schema.ts`

- [ ] **Step 1: Add the two `@Prop` fields after `referredBy`**

```ts
@Prop({ type: Number, default: 0, min: 0 })
coins!: number;

@Prop({ type: Number, default: 0, min: 0 })
gems!: number;
```

- [ ] **Step 2: Run BE typecheck**

```bash
pnpm --filter be typecheck
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/auth/schemas/user.schema.ts
git commit -m "feat(wallet): add coins and gems balance fields to User (ARC-615)"
```

### Task 3 — Wallet exceptions

**Files:**

- Create: `apps/be/src/wallet/exceptions/insufficient-funds.exception.ts`
- Create: `apps/be/src/wallet/exceptions/invalid-currency.exception.ts`

- [ ] **Step 1: `InsufficientFundsException`**

```ts
import { HttpException, HttpStatus } from '@nestjs/common';
import type { WalletCurrency } from '../interfaces/wallet-types';

export class InsufficientFundsException extends HttpException {
  constructor(currency: WalletCurrency, requested: number, available: number) {
    super(
      {
        message: 'wallet.insufficientFunds',
        currency,
        requested,
        available,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
```

- [ ] **Step 2: `InvalidCurrencyException`**

```ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCurrencyException extends HttpException {
  constructor(received: string) {
    super(
      { message: 'wallet.invalidCurrency', received },
      HttpStatus.BAD_REQUEST,
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/wallet/exceptions/
git commit -m "feat(wallet): add insufficient-funds and invalid-currency exceptions (ARC-615)"
```

### Task 4 — `WalletTransaction` schema

**Files:**

- Create: `apps/be/src/wallet/schemas/wallet-transaction.schema.ts`

- [ ] **Step 1: Schema**

```ts
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  WALLET_CURRENCIES,
  WALLET_REASONS,
  type WalletCurrency,
  type WalletReason,
} from '../interfaces/wallet-types';

@Schema({ timestamps: true })
export class WalletTransaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: WALLET_CURRENCIES, required: true })
  currency!: WalletCurrency;

  @Prop({ type: Number, required: true })
  delta!: number; // signed: + credit, - debit

  @Prop({ type: Number, required: true, min: 0 })
  balanceAfter!: number;

  @Prop({ type: String, enum: WALLET_REASONS, required: true })
  reason!: WalletReason;

  @Prop({ type: String, required: true, unique: true })
  idempotencyKey!: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export type WalletTransactionDocument = WalletTransaction & Document;
export const WalletTransactionSchema =
  SchemaFactory.createForClass(WalletTransaction);

WalletTransactionSchema.index({ userId: 1, createdAt: -1, _id: -1 });
WalletTransactionSchema.index({
  userId: 1,
  currency: 1,
  createdAt: -1,
  _id: -1,
});
```

- [ ] **Step 2: Commit**

```bash
git add apps/be/src/wallet/schemas/wallet-transaction.schema.ts
git commit -m "feat(wallet): add WalletTransaction ledger schema (ARC-615)"
```

### Task 5 — Wallet interfaces

**Files:**

- Create: `apps/be/src/wallet/interfaces/wallet-balance.interface.ts`
- Create: `apps/be/src/wallet/interfaces/wallet-transaction.interface.ts`

- [ ] **Step 1: Balance interface**

```ts
export interface WalletBalance {
  coins: number;
  gems: number;
}
```

- [ ] **Step 2: Public transaction interface (omits `idempotencyKey`)**

```ts
import type { WalletCurrency, WalletReason } from './wallet-types';

export interface WalletTransactionView {
  id: string;
  currency: WalletCurrency;
  delta: number;
  balanceAfter: number;
  reason: WalletReason;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface PaginatedWalletTransactions {
  items: WalletTransactionView[];
  nextCursor: string | null;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/wallet/interfaces/
git commit -m "feat(wallet): add balance and transaction view interfaces (ARC-615)"
```

### Task 6 — `WalletService` scaffold (no logic yet) + module

**Files:**

- Create: `apps/be/src/wallet/wallet.service.ts`
- Create: `apps/be/src/wallet/wallet.module.ts`

- [ ] **Step 1: Service scaffold (methods throw, to be filled in by TDD tasks 7–10)**

```ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import {
  WalletTransaction,
  WalletTransactionDocument,
} from './schemas/wallet-transaction.schema';
import type { WalletCurrency, WalletReason } from './interfaces/wallet-types';
import type {
  WalletBalance,
  WalletTransactionView,
  PaginatedWalletTransactions,
} from './interfaces/wallet-balance.interface';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(WalletTransaction.name)
    private readonly txModel: Model<WalletTransactionDocument>,
  ) {}

  async credit(
    userId: string,
    currency: WalletCurrency,
    amount: number,
    reason: WalletReason,
    idempotencyKey: string,
    metadata?: Record<string, unknown>,
  ): Promise<WalletTransactionView> {
    throw new Error('not implemented');
  }

  async debit(
    userId: string,
    currency: WalletCurrency,
    amount: number,
    reason: WalletReason,
    idempotencyKey: string,
    metadata?: Record<string, unknown>,
  ): Promise<WalletTransactionView> {
    throw new Error('not implemented');
  }

  async getBalance(userId: string): Promise<WalletBalance> {
    throw new Error('not implemented');
  }

  async getHistory(
    userId: string,
    opts: { currency?: WalletCurrency; cursor?: string; limit?: number },
  ): Promise<PaginatedWalletTransactions> {
    throw new Error('not implemented');
  }
}
```

- [ ] **Step 2: Module (mirrors `tournaments.module.ts`)**

```ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserSchema } from '../auth/schemas/user.schema';
import {
  WalletTransaction,
  WalletTransactionSchema,
} from './schemas/wallet-transaction.schema';
import { WalletService } from './wallet.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
    ]),
  ],
  providers: [WalletService, RolesGuard],
  exports: [WalletService],
})
export class WalletModule {}
```

- [ ] **Step 3: Wire into `AppModule`**

Edit [apps/be/src/app.module.ts](../../apps/be/src/app.module.ts), import `WalletModule`, add it to the `imports` array.

- [ ] **Step 4: Run BE typecheck**

```bash
pnpm --filter be typecheck
```

Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/wallet/wallet.service.ts apps/be/src/wallet/wallet.module.ts apps/be/src/app.module.ts
git commit -m "feat(wallet): scaffold WalletModule and service (ARC-615)"
```

### Task 7 — `WalletService.credit` (TDD)

**Files:**

- Create: `apps/be/src/wallet/wallet.service.spec.ts`
- Modify: `apps/be/src/wallet/wallet.service.ts`

The wallet service uses Mongo transactions, but for unit-style tests we use mocked Mongoose models — atomicity is verified separately in the integration test (Task 12).

- [ ] **Step 1: Failing test for happy-path credit**

```ts
// wallet.service.spec.ts
import { Test } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { WalletService } from './wallet.service';
import { User } from '../auth/schemas/user.schema';
import { WalletTransaction } from './schemas/wallet-transaction.schema';

describe('WalletService', () => {
  const userId = new Types.ObjectId().toHexString();

  let service: WalletService;
  let userModel: { findOneAndUpdate: jest.Mock; findById: jest.Mock };
  let txModel: { create: jest.Mock; findOne: jest.Mock; find: jest.Mock };
  let connection: {
    startSession: jest.Mock;
  };
  let session: {
    withTransaction: jest.Mock;
    endSession: jest.Mock;
  };

  beforeEach(async () => {
    userModel = {
      findOneAndUpdate: jest.fn(),
      findById: jest.fn(),
    };
    txModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };
    session = {
      withTransaction: jest.fn(async (cb) => cb()),
      endSession: jest.fn(),
    };
    connection = {
      startSession: jest.fn().mockResolvedValue(session),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: getConnectionToken(), useValue: connection },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(WalletTransaction.name), useValue: txModel },
      ],
    }).compile();

    service = moduleRef.get(WalletService);
  });

  describe('credit', () => {
    it('increments balance and writes a ledger row', async () => {
      userModel.findOneAndUpdate.mockReturnValue({
        session: () => Promise.resolve({ coins: 100, gems: 0 }),
      });
      txModel.create.mockResolvedValue([
        {
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(userId),
          currency: 'coins',
          delta: 100,
          balanceAfter: 100,
          reason: 'admin_grant',
          idempotencyKey: 'k1',
          createdAt: new Date('2026-05-09T00:00:00Z'),
          toObject() {
            return this;
          },
        },
      ]);

      const result = await service.credit(
        userId,
        'coins',
        100,
        'admin_grant',
        'k1',
        { adminUserId: 'admin-1' },
      );

      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(Types.ObjectId) },
        { $inc: { coins: 100 } },
        expect.objectContaining({ new: true }),
      );
      expect(txModel.create).toHaveBeenCalled();
      expect(result.delta).toBe(100);
      expect(result.balanceAfter).toBe(100);
    });
  });
});
```

- [ ] **Step 2: Run test, expect failure (`not implemented`)**

```bash
pnpm --filter be exec jest wallet.service.spec
```

Expected: FAIL.

- [ ] **Step 3: Implement `credit`**

```ts
async credit(
  userId: string,
  currency: WalletCurrency,
  amount: number,
  reason: WalletReason,
  idempotencyKey: string,
  metadata?: Record<string, unknown>,
): Promise<WalletTransactionView> {
  this.assertPositiveInteger(amount);
  this.assertCurrency(currency);

  const session = await this.connection.startSession();
  try {
    let createdTx: WalletTransactionDocument | null = null;

    await session.withTransaction(async () => {
      const user = await this.userModel
        .findOneAndUpdate(
          { _id: new Types.ObjectId(userId) },
          { $inc: { [currency]: amount } },
          { new: true, session },
        )
        .session(session);

      if (!user) {
        throw new NotFoundException('wallet.userNotFound');
      }

      const docs = await this.txModel.create(
        [
          {
            userId: new Types.ObjectId(userId),
            currency,
            delta: amount,
            balanceAfter: (user as User & Record<string, number>)[currency],
            reason,
            idempotencyKey,
            metadata,
          },
        ],
        { session },
      );

      createdTx = docs[0];
    });

    if (!createdTx) {
      throw new InternalServerErrorException('wallet.transactionFailed');
    }

    return this.toView(createdTx);
  } catch (err) {
    if (this.isDuplicateIdempotencyKey(err)) {
      const prior = await this.txModel.findOne({ idempotencyKey });
      if (prior) return this.toView(prior);
    }
    throw err;
  } finally {
    await session.endSession();
  }
}

private assertPositiveInteger(amount: number): void {
  if (!Number.isInteger(amount) || amount <= 0) {
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
  const obj = doc.toObject ? doc.toObject() : (doc as unknown as WalletTransaction & { _id: Types.ObjectId; createdAt: Date });
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
```

Add the missing imports: `BadRequestException`, `NotFoundException`, `InternalServerErrorException` from `@nestjs/common`; `InvalidCurrencyException` from `./exceptions/invalid-currency.exception`.

- [ ] **Step 4: Run test, expect pass**

```bash
pnpm --filter be exec jest wallet.service.spec
```

Expected: PASS.

- [ ] **Step 5: Add rejection tests for non-positive / non-integer / unknown currency**

```ts
it('rejects zero amount', async () => {
  await expect(
    service.credit(userId, 'coins', 0, 'admin_grant', 'k', undefined),
  ).rejects.toThrow();
});

it('rejects fractional amount', async () => {
  await expect(
    service.credit(userId, 'coins', 1.5, 'admin_grant', 'k', undefined),
  ).rejects.toThrow();
});

it('rejects unknown currency', async () => {
  await expect(
    service.credit(
      userId,
      'tickets' as never,
      10,
      'admin_grant',
      'k',
      undefined,
    ),
  ).rejects.toThrow();
});
```

- [ ] **Step 6: Run, expect pass; commit**

```bash
pnpm --filter be exec jest wallet.service.spec
git add apps/be/src/wallet/
git commit -m "feat(wallet): implement credit with idempotency + validation (ARC-615)"
```

### Task 8 — `WalletService.debit` (TDD)

**Files:**

- Modify: `apps/be/src/wallet/wallet.service.ts`
- Modify: `apps/be/src/wallet/wallet.service.spec.ts`

- [ ] **Step 1: Failing tests for debit happy path + insufficient funds**

```ts
describe('debit', () => {
  it('decrements balance and writes a ledger row', async () => {
    userModel.findOneAndUpdate.mockReturnValue({
      session: () => Promise.resolve({ coins: 50, gems: 0 }),
    });
    txModel.create.mockResolvedValue([
      {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        currency: 'coins',
        delta: -50,
        balanceAfter: 50,
        reason: 'admin_deduct',
        idempotencyKey: 'k2',
        createdAt: new Date('2026-05-09T00:00:00Z'),
        toObject() {
          return this;
        },
      },
    ]);

    const result = await service.debit(
      userId,
      'coins',
      50,
      'admin_deduct',
      'k2',
    );

    expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: expect.any(Types.ObjectId), coins: { $gte: 50 } },
      { $inc: { coins: -50 } },
      expect.objectContaining({ new: true }),
    );
    expect(result.delta).toBe(-50);
  });

  it('throws InsufficientFundsException when balance < amount', async () => {
    userModel.findOneAndUpdate.mockReturnValue({
      session: () => Promise.resolve(null), // no doc matched the $gte
    });
    userModel.findById.mockResolvedValue({ coins: 10, gems: 0 });

    await expect(
      service.debit(userId, 'coins', 50, 'admin_deduct', 'k3'),
    ).rejects.toThrow(/insufficientFunds/);
    expect(txModel.create).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run, expect failure**

- [ ] **Step 3: Implement `debit`**

```ts
async debit(
  userId: string,
  currency: WalletCurrency,
  amount: number,
  reason: WalletReason,
  idempotencyKey: string,
  metadata?: Record<string, unknown>,
): Promise<WalletTransactionView> {
  this.assertPositiveInteger(amount);
  this.assertCurrency(currency);

  const session = await this.connection.startSession();
  try {
    let createdTx: WalletTransactionDocument | null = null;

    await session.withTransaction(async () => {
      const user = await this.userModel
        .findOneAndUpdate(
          {
            _id: new Types.ObjectId(userId),
            [currency]: { $gte: amount },
          },
          { $inc: { [currency]: -amount } },
          { new: true, session },
        )
        .session(session);

      if (!user) {
        const current = await this.userModel
          .findById(userId)
          .session(session)
          .lean();
        const available = current
          ? (current as Record<string, number>)[currency] ?? 0
          : 0;
        throw new InsufficientFundsException(currency, amount, available);
      }

      const docs = await this.txModel.create(
        [
          {
            userId: new Types.ObjectId(userId),
            currency,
            delta: -amount,
            balanceAfter: (user as User & Record<string, number>)[currency],
            reason,
            idempotencyKey,
            metadata,
          },
        ],
        { session },
      );

      createdTx = docs[0];
    });

    if (!createdTx) {
      throw new InternalServerErrorException('wallet.transactionFailed');
    }

    return this.toView(createdTx);
  } catch (err) {
    if (this.isDuplicateIdempotencyKey(err)) {
      const prior = await this.txModel.findOne({ idempotencyKey });
      if (prior) return this.toView(prior);
    }
    throw err;
  } finally {
    await session.endSession();
  }
}
```

Add `InsufficientFundsException` import.

- [ ] **Step 4: Run, expect pass**

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/wallet/
git commit -m "feat(wallet): implement debit with insufficient-funds guard (ARC-615)"
```

### Task 9 — Idempotency: duplicate-key returns prior tx (TDD)

**Files:**

- Modify: `apps/be/src/wallet/wallet.service.spec.ts`

- [ ] **Step 1: Failing test for duplicate-key path**

```ts
describe('idempotency', () => {
  it('returns the prior transaction when the key is reused', async () => {
    const priorId = new Types.ObjectId();
    session.withTransaction.mockImplementationOnce(async () => {
      const err = new Error('dup') as Error & {
        code: number;
        keyPattern: Record<string, number>;
      };
      err.code = 11000;
      err.keyPattern = { idempotencyKey: 1 };
      throw err;
    });
    txModel.findOne.mockResolvedValue({
      _id: priorId,
      userId: new Types.ObjectId(userId),
      currency: 'coins',
      delta: 100,
      balanceAfter: 100,
      reason: 'admin_grant',
      idempotencyKey: 'k-dup',
      createdAt: new Date('2026-05-09T00:00:00Z'),
      toObject() {
        return this;
      },
    });

    const result = await service.credit(
      userId,
      'coins',
      100,
      'admin_grant',
      'k-dup',
    );

    expect(result.id).toBe(String(priorId));
    expect(txModel.create).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run; should already pass since `credit`/`debit` already handle dup-key. If not, fix.**

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/wallet/wallet.service.spec.ts
git commit -m "test(wallet): cover idempotency duplicate-key path (ARC-615)"
```

### Task 10 — `getBalance` and `getHistory` (TDD)

**Files:**

- Modify: `apps/be/src/wallet/wallet.service.spec.ts`
- Modify: `apps/be/src/wallet/wallet.service.ts`

- [ ] **Step 1: Failing tests**

```ts
describe('getBalance', () => {
  it('returns the user coins/gems', async () => {
    userModel.findById.mockReturnValue({
      lean: () => Promise.resolve({ coins: 42, gems: 3 }),
    });
    const r = await service.getBalance(userId);
    expect(r).toEqual({ coins: 42, gems: 3 });
  });
});

describe('getHistory', () => {
  it('paginates by createdAt + _id and respects currency filter', async () => {
    const items = [
      {
        _id: new Types.ObjectId(),
        userId,
        currency: 'coins',
        delta: 5,
        balanceAfter: 5,
        reason: 'admin_grant',
        idempotencyKey: 'a',
        createdAt: new Date('2026-05-09T01:00:00Z'),
        toObject() {
          return this;
        },
      },
    ];
    txModel.find.mockReturnValue({
      sort: () => ({ limit: () => ({ lean: () => Promise.resolve(items) }) }),
    });
    const r = await service.getHistory(userId, { currency: 'coins', limit: 1 });
    expect(r.items).toHaveLength(1);
    expect(r.nextCursor).toBe(null);
  });
});
```

- [ ] **Step 2: Implement `getBalance`**

```ts
async getBalance(userId: string): Promise<WalletBalance> {
  const user = await this.userModel.findById(userId).lean();
  if (!user) throw new NotFoundException('wallet.userNotFound');
  return {
    coins: (user as Record<string, number>).coins ?? 0,
    gems: (user as Record<string, number>).gems ?? 0,
  };
}
```

- [ ] **Step 3: Implement `getHistory` with cursor pagination**

Cursor format: base64-encoded `${createdAtMs}:${_id}`. The service decodes cursor → `{ createdAt: Date; _id: ObjectId }`, queries `{ userId, ...filter, $or: [{ createdAt: { $lt }}, { createdAt: eq, _id: { $lt }}] }`, sorts `{ createdAt: -1, _id: -1 }`, limits to `limit + 1`. If extra row exists, encode the last in-result row's cursor as `nextCursor`.

```ts
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
    this.toView(d as WalletTransactionDocument),
  );
  const nextCursor = hasMore
    ? this.encodeCursor(
        new Date(items[items.length - 1].createdAt),
        new Types.ObjectId(items[items.length - 1].id),
      )
    : null;

  return { items, nextCursor };
}

private encodeCursor(createdAt: Date, id: Types.ObjectId): string {
  return Buffer.from(`${createdAt.getTime()}:${id.toHexString()}`, 'utf8').toString('base64url');
}

private decodeCursor(cursor: string): { createdAt: Date; _id: Types.ObjectId } {
  try {
    const [ms, id] = Buffer.from(cursor, 'base64url').toString('utf8').split(':');
    return {
      createdAt: new Date(Number(ms)),
      _id: new Types.ObjectId(id),
    };
  } catch {
    throw new BadRequestException('wallet.invalidCursor');
  }
}
```

- [ ] **Step 4: Run, expect pass**

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/wallet/
git commit -m "feat(wallet): implement getBalance and getHistory (ARC-615)"
```

---

## Phase 2 — HTTP API: controllers + DTOs

### Task 11 — DTOs

**Files:**

- Create: `apps/be/src/wallet/dto/grant-wallet.dto.ts`
- Create: `apps/be/src/wallet/dto/deduct-wallet.dto.ts`
- Create: `apps/be/src/wallet/dto/list-transactions.dto.ts`

- [ ] **Step 1: Grant DTO**

```ts
import {
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';
import {
  WALLET_CURRENCIES,
  type WalletCurrency,
} from '../interfaces/wallet-types';

export class GrantWalletDto {
  @IsIn(WALLET_CURRENCIES as readonly string[])
  currency!: WalletCurrency;

  @IsInt()
  @IsPositive()
  @Max(1_000_000)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
```

- [ ] **Step 2: Deduct DTO** — identical shape; same validators.

- [ ] **Step 3: List query DTO**

```ts
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import {
  WALLET_CURRENCIES,
  type WalletCurrency,
} from '../interfaces/wallet-types';

export class ListTransactionsDto {
  @IsOptional()
  @IsIn(WALLET_CURRENCIES as readonly string[])
  currency?: WalletCurrency;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/be/src/wallet/dto/
git commit -m "feat(wallet): add grant/deduct/list DTOs with class-validator (ARC-615)"
```

### Task 12 — Player `WalletController` (TDD)

**Files:**

- Create: `apps/be/src/wallet/wallet.controller.ts`
- Create: `apps/be/src/wallet/wallet.controller.spec.ts`

Use the same integration-style controller test pattern as [admin-users.controller.spec.ts](../../apps/be/src/admin/admin-users.controller.spec.ts) (Test module, override JwtAuthGuard, supertest server).

- [ ] **Step 1: Failing test for `GET /wallet/balance`**

```ts
describe('WalletController', () => {
  // ... bootstrap mirroring admin-users.controller.spec.ts ...
  it('GET /wallet/balance returns the user balance', async () => {
    walletService.getBalance.mockResolvedValue({ coins: 25, gems: 0 });
    const res = await request(server()).get('/wallet/balance');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ coins: 25, gems: 0 });
    expect(walletService.getBalance).toHaveBeenCalledWith(
      'requester-id-not-real',
    );
  });
});
```

- [ ] **Step 2: Implement controller**

```ts
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { WalletService } from './wallet.service';
import { ListTransactionsDto } from './dto/list-transactions.dto';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get('balance')
  async balance(@Req() req: { user: AuthenticatedUser }) {
    return this.wallet.getBalance(req.user.userId);
  }

  @Get('transactions')
  async transactions(
    @Req() req: { user: AuthenticatedUser },
    @Query() query: ListTransactionsDto,
  ) {
    return this.wallet.getHistory(req.user.userId, query);
  }
}
```

- [ ] **Step 3: Run test; expect pass; add transactions test for cursor**

- [ ] **Step 4: Register controller in `WalletModule`**

```ts
controllers: [WalletController],
```

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/wallet/
git commit -m "feat(wallet): add player wallet controller (ARC-615)"
```

### Task 13 — `AdminWalletController` (TDD)

**Files:**

- Create: `apps/be/src/wallet/admin-wallet.controller.ts`
- Create: `apps/be/src/wallet/admin-wallet.controller.spec.ts`

- [ ] **Step 1: Failing tests**

Mirror `admin-tournaments.controller.spec.ts` style. Cover:

- `POST /admin/wallet/users/:userId/grant` — calls `walletService.credit` with `reason: 'admin_grant'`, server-generated UUID idempotency key, metadata `{ adminUserId, note }`.
- `POST /admin/wallet/users/:userId/deduct` — same with `reason: 'admin_deduct'`.
- Returns 422 when `InsufficientFundsException` is thrown by the service.
- DTO validation rejects negative amounts, fractional amounts, missing `currency`.
- `GET /admin/wallet/users/:userId/balance` returns the target user's balance.

- [ ] **Step 2: Implement controller**

```ts
import { randomUUID } from 'crypto';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { WalletService } from './wallet.service';
import { GrantWalletDto } from './dto/grant-wallet.dto';
import { DeductWalletDto } from './dto/deduct-wallet.dto';
import { ListTransactionsDto } from './dto/list-transactions.dto';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

@Controller('admin/wallet/users/:userId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminWalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get('balance')
  balance(@Param('userId') userId: string) {
    return this.wallet.getBalance(userId);
  }

  @Get('transactions')
  transactions(
    @Param('userId') userId: string,
    @Query() query: ListTransactionsDto,
  ) {
    return this.wallet.getHistory(userId, query);
  }

  @Post('grant')
  grant(
    @Req() req: { user: AuthenticatedUser },
    @Param('userId') userId: string,
    @Body() dto: GrantWalletDto,
  ) {
    return this.wallet.credit(
      userId,
      dto.currency,
      dto.amount,
      'admin_grant',
      randomUUID(),
      { adminUserId: req.user.userId, note: dto.note },
    );
  }

  @Post('deduct')
  deduct(
    @Req() req: { user: AuthenticatedUser },
    @Param('userId') userId: string,
    @Body() dto: DeductWalletDto,
  ) {
    return this.wallet.debit(
      userId,
      dto.currency,
      dto.amount,
      'admin_deduct',
      randomUUID(),
      { adminUserId: req.user.userId, note: dto.note },
    );
  }
}
```

Verify [apps/be/src/auth/guards/roles.decorator.ts](../../apps/be/src/auth/guards/roles.decorator.ts) is the correct import path for `@Roles`.

- [ ] **Step 3: Register in module**

```ts
controllers: [WalletController, AdminWalletController],
```

- [ ] **Step 4: Run tests; expect pass**

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/wallet/
git commit -m "feat(wallet): add admin wallet controller (ARC-615)"
```

### Task 14 — Integration test: real Mongo replica set

**Files:**

- Create: `apps/be/src/wallet/wallet.service.integration-spec.ts`

This test uses `mongodb-memory-server` with `replicaSet: { count: 1 }` so Mongo transactions actually work. If `mongodb-memory-server` isn't already a devDep, install it (`pnpm --filter be add -D mongodb-memory-server`) and add `--testPathPattern integration-spec` selection to the BE jest config.

- [ ] **Step 1: Boot a Nest app with `MongooseModule.forRoot(uri)` from the in-memory server**

- [ ] **Step 2: Test: end-to-end credit + debit + idempotency**

```ts
it('round-trips credit + debit and is idempotent', async () => {
  const u = await userModel.create({ email: 'a@x.com' /* ... */ });
  await wallet.credit(u._id.toString(), 'coins', 50, 'admin_grant', 'k1');
  await wallet.credit(u._id.toString(), 'coins', 50, 'admin_grant', 'k1'); // dup
  const after = await wallet.getBalance(u._id.toString());
  expect(after.coins).toBe(50); // idempotent — only one credit applied
});
```

- [ ] **Step 3: Test: concurrent debit race**

```ts
it('only one of two concurrent debits succeeds when balance < total', async () => {
  const u = await userModel.create({ /*...*/ coins: 50 });
  const id = u._id.toString();
  const results = await Promise.allSettled([
    wallet.debit(id, 'coins', 50, 'admin_deduct', 'k-a'),
    wallet.debit(id, 'coins', 50, 'admin_deduct', 'k-b'),
  ]);
  const ok = results.filter((r) => r.status === 'fulfilled').length;
  const fail = results.filter((r) => r.status === 'rejected').length;
  expect(ok).toBe(1);
  expect(fail).toBe(1);
  const after = await wallet.getBalance(id);
  expect(after.coins).toBe(0);
});
```

- [ ] **Step 4: Run; expect pass**

```bash
pnpm --filter be exec jest wallet.service.integration-spec
```

- [ ] **Step 5: Commit**

```bash
git add apps/be/
git commit -m "test(wallet): add integration tests for atomicity and idempotency (ARC-615)"
```

---

## Phase 3 — Socket emit + module bootstrap

### Task 15 — `WalletGateway` and emit hook

**Files:**

- Create: `apps/be/src/wallet/wallet.gateway.ts`
- Modify: `apps/be/src/wallet/wallet.service.ts`
- Modify: `apps/be/src/wallet/wallet.module.ts`

- [ ] **Step 1: Gateway**

```ts
import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { corsOriginMatcher } from '../common/utils/cors.util';
import type { WalletBalance } from './interfaces/wallet-balance.interface';

@WebSocketGateway({
  namespace: '/wallet',
  cors: { origin: corsOriginMatcher },
})
export class WalletGateway {
  private readonly logger = new Logger(WalletGateway.name);

  @WebSocketServer() server!: Server;

  @SubscribeMessage('joinWallet')
  async handleJoin(
    @MessageBody() body: { userId?: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = typeof body?.userId === 'string' ? body.userId.trim() : '';
    if (!userId) return;
    await client.join(userId);
  }

  emitBalance(userId: string, balance: WalletBalance): void {
    this.server.to(userId).emit('wallet:updated', balance);
  }
}
```

Note: matches the existing chat.gateway.ts join-by-user-id pattern.

- [ ] **Step 2: Service consumes the gateway after every successful write**

In the service, inject `WalletGateway` and call `emitBalance(userId, { coins: ..., gems: ... })` after the `withTransaction` block exits successfully. To avoid an extra DB read, derive the new balances from the `findOneAndUpdate` returns: capture both currencies from the `user` doc returned by the conditional update.

```ts
constructor(
  // ...
  private readonly gateway: WalletGateway,
) {}
```

After successful `credit`/`debit`:

```ts
this.gateway.emitBalance(userId, {
  coins: (user as Record<string, number>).coins ?? 0,
  gems: (user as Record<string, number>).gems ?? 0,
});
```

(Pass the full user doc out of the transaction closure; the existing implementation only kept `createdTx`. Lift `lastBalance` to the outer scope.)

- [ ] **Step 3: Register the gateway as a provider in `WalletModule`**

```ts
providers: [WalletService, WalletGateway, RolesGuard],
exports: [WalletService],
```

- [ ] **Step 4: Update `WalletService` unit test to inject a mocked `WalletGateway`**

```ts
{ provide: WalletGateway, useValue: { emitBalance: jest.fn() } },
```

Add an assertion to the credit/debit happy-path tests:

```ts
expect(walletGateway.emitBalance).toHaveBeenCalledWith(
  userId,
  expect.any(Object),
);
```

- [ ] **Step 5: Run BE tests**

```bash
pnpm --filter be test
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add apps/be/src/wallet/
git commit -m "feat(wallet): emit wallet:updated socket event on every mutation (ARC-615)"
```

### Task 16 — Backfill bootstrap

**Files:**

- Create: `apps/be/src/wallet/lib/wallet-bootstrap.ts`
- Modify: `apps/be/src/wallet/wallet.module.ts`

- [ ] **Step 1: Bootstrap**

```ts
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';

@Injectable()
export class WalletBootstrap implements OnApplicationBootstrap {
  private readonly logger = new Logger(WalletBootstrap.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const result = await this.userModel.updateMany(
      { $or: [{ coins: { $exists: false } }, { gems: { $exists: false } }] },
      { $setOnInsert: {}, $set: { coins: 0, gems: 0 } } as never,
      // $setOnInsert is a no-op for updateMany but Mongoose is strict.
    );
    if (result.modifiedCount > 0) {
      this.logger.log(`Wallet backfill: filled ${result.modifiedCount} users`);
    }
  }
}
```

(Adjust the `$set` to drop `$setOnInsert` if Mongoose typings allow — the goal is to set `coins`/`gems` to 0 for any user missing them. Test the query shape locally before committing.)

- [ ] **Step 2: Register in `WalletModule.providers`**

- [ ] **Step 3: Verify locally with one record missing the field**

- [ ] **Step 4: Commit**

```bash
git add apps/be/src/wallet/
git commit -m "feat(wallet): backfill coins/gems on application bootstrap (ARC-615)"
```

---

## Phase 4 — ESLint guardrail

### Task 17 — Restrict direct `coins`/`gems` mutation outside the wallet module

**Files:**

- Modify: `apps/be/.eslintrc.cjs` (or whichever config the BE actually uses)
- Create: `apps/be/src/wallet/.eslintrc.cjs` — override that disables the rule
- Modify: `apps/web/.eslintrc.cjs` — same rule, no override (web should never mutate)

- [ ] **Step 1: Locate the actual ESLint config files**

```bash
find apps/be apps/web -maxdepth 3 \( -name ".eslintrc*" -o -name "eslint.config.*" \) -not -path '*/node_modules/*'
```

- [ ] **Step 2: Add the rule (BE root config)**

```js
rules: {
  // ... existing ...
  'no-restricted-syntax': [
    'error',
    {
      selector: "MemberExpression[property.name=/^(coins|gems)$/]",
      message: 'Direct access to wallet balance fields is forbidden outside `apps/be/src/wallet/`. Use WalletService.',
    },
  ],
},
```

- [ ] **Step 3: Add wallet override**

```js
// apps/be/src/wallet/.eslintrc.cjs
module.exports = {
  rules: {
    'no-restricted-syntax': 'off',
  },
};
```

(If the project uses flat ESLint config, add an override block keyed on `files: ['apps/be/src/wallet/**']` with the rule disabled.)

- [ ] **Step 4: Mirror to web ESLint config (no override needed)**

- [ ] **Step 5: Run lint**

```bash
pnpm lint
```

Expected: passes. If a legitimate access exists outside the wallet module that we missed, the rule will flag it — fix or whitelist with explanation.

- [ ] **Step 6: Commit**

```bash
git add apps/be/.eslintrc* apps/be/src/wallet/.eslintrc* apps/web/.eslintrc*
git commit -m "chore(wallet): restrict direct coins/gems access outside WalletService (ARC-615)"
```

---

## Phase 5 — Web: server module + i18n primitives

### Task 18 — Web wallet server module

**Files:**

- Create: `apps/web/src/features/wallet/server/wallet.types.ts`
- Create: `apps/web/src/features/wallet/server/wallet.server.ts`

- [ ] **Step 1: Types (mirror BE interfaces)**

```ts
export type WalletCurrency = 'coins' | 'gems';
export type WalletReason = 'admin_grant' | 'admin_deduct';

export interface WalletBalance {
  coins: number;
  gems: number;
}

export interface WalletTransactionView {
  id: string;
  currency: WalletCurrency;
  delta: number;
  balanceAfter: number;
  reason: WalletReason;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface PaginatedWalletTransactions {
  items: WalletTransactionView[];
  nextCursor: string | null;
}
```

- [ ] **Step 2: Server module**

```ts
import 'server-only';
import { cookies, headers } from 'next/headers';
import type {
  PaginatedWalletTransactions,
  WalletBalance,
  WalletCurrency,
} from './wallet.types';
import { resolveApiUrl } from '@/shared/lib/api-base';

async function fetchWithAuth<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieJar = await cookies();
  const token = cookieJar.get('access_token')?.value; // confirm the cookie name
  const url = resolveApiUrl(path);

  const res = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Wallet fetch failed: ${res.status} ${body}`);
  }
  return (await res.json()) as T;
}

export async function getWalletBalance(): Promise<WalletBalance> {
  return fetchWithAuth<WalletBalance>('/wallet/balance');
}

export async function getWalletTransactions(opts: {
  currency?: WalletCurrency;
  cursor?: string;
  limit?: number;
}): Promise<PaginatedWalletTransactions> {
  const params = new URLSearchParams();
  if (opts.currency) params.set('currency', opts.currency);
  if (opts.cursor) params.set('cursor', opts.cursor);
  if (opts.limit) params.set('limit', String(opts.limit));
  const qs = params.toString();
  return fetchWithAuth<PaginatedWalletTransactions>(
    `/wallet/transactions${qs ? `?${qs}` : ''}`,
  );
}
```

(Confirm the existing auth cookie name with `grep -rn "access_token\|jwt" apps/web/src/shared/lib`. If the project uses a different mechanism — e.g. a `getServerSession()` helper — use that instead.)

- [ ] **Step 3: Vitest for the server module**

Mock `next/headers` and `fetch`; assert balance shape, query string composition, error path.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/wallet/
git commit -m "feat(wallet): add web server module for wallet data fetching (ARC-615)"
```

### Task 19 — i18n keys (web): wallet namespace

**Files:**

- Create: `apps/web/src/shared/i18n/messages/pages/wallet/{en,ru,es,fr,by}.ts`
- Modify: `apps/web/src/shared/i18n/messages/pages/index.ts` (or wherever namespaces are registered — confirm via the existing `admin-announcements` setup as exemplar)

- [ ] **Step 1: `en.ts` baseline**

```ts
export const walletEn = {
  meta: {
    title: 'Wallet · Arcadeum',
    description: 'View your coins, gems, and transaction history.',
  },
  chip: {
    coinsLabel: 'Coins',
    gemsLabel: 'Gems',
  },
  page: {
    title: 'Your wallet',
    summary: 'Coins are earned through play. Gems are purchased.',
    filters: {
      all: 'All',
      coins: 'Coins',
      gems: 'Gems',
    },
    columns: {
      reason: 'Reason',
      delta: 'Change',
      balanceAfter: 'Balance after',
      createdAt: 'When',
    },
    next: 'Next',
    empty: {
      title: 'No transactions yet',
      description: 'Your wallet activity will appear here.',
    },
    error: {
      title: "Couldn't load your wallet",
      retry: 'Try again',
    },
  },
  reasons: {
    admin_grant: 'Granted by admin',
    admin_deduct: 'Deducted by admin',
  },
  errors: {
    insufficientFunds: 'Insufficient balance.',
    invalidCurrency: 'Unknown currency.',
    invalidAmount: 'Amount must be a positive integer.',
    transactionFailed: 'Transaction failed. Please try again.',
  },
};
export type WalletI18n = typeof walletEn;
```

- [ ] **Step 2: ru/es/fr/by mirror `en` with translations**

Each file exports the matching object with translations and asserts the `WalletI18n` type so missing keys fail typecheck:

```ts
import type { WalletI18n } from './en';
export const walletRu: WalletI18n = {
  /* ... */
};
```

- [ ] **Step 3: Register the namespace per existing pattern (see `pages/admin-announcements/`)**

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/shared/i18n/
git commit -m "feat(wallet): add wallet i18n namespace (en/ru/es/fr/by) (ARC-615)"
```

### Task 20 — i18n keys (web): admin-wallet namespace

**Files:**

- Create: `apps/web/src/shared/i18n/messages/pages/admin-wallet/{en,ru,es,fr,by}.ts`
- Modify: registry

- [ ] **Step 1: `en.ts`**

```ts
export const adminWalletEn = {
  drawer: {
    title: 'Wallet',
    sections: {
      balance: 'Balance',
      grantDeduct: 'Grant or deduct',
      recent: 'Recent transactions',
    },
  },
  form: {
    currencyLabel: 'Currency',
    amountLabel: 'Amount',
    noteLabel: 'Note (optional)',
    grant: 'Grant',
    deduct: 'Deduct',
    submitting: 'Working…',
    success: 'Done.',
  },
  errors: {
    insufficient: 'Not enough balance to deduct that amount.',
    generic: 'Something went wrong. Please retry.',
  },
};
export type AdminWalletI18n = typeof adminWalletEn;
```

- [ ] **Step 2: 4 more locales**
- [ ] **Step 3: Register**
- [ ] **Step 4: Commit**

---

## Phase 6 — Web UI: balance chip + live bridge + wallet page

### Task 21 — Wallet socket client

**Files:**

- Create: `apps/web/src/features/wallet/lib/wallet-socket.ts`

- [ ] **Step 1: Singleton socket on the `/wallet` namespace**

Mirror the patterns in [apps/web/src/shared/lib/socket.ts](../../apps/web/src/shared/lib/socket.ts):

```ts
import { io, type Socket } from 'socket.io-client';
import { resolveApiUrl } from '@/shared/lib/api-base';

function resolveSocketUrl(): string {
  const apiUrl = resolveApiUrl('');
  try {
    const url = new URL(apiUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.toString().replace(/\/$/, '');
  } catch {
    return apiUrl.replace(/\/$/, '');
  }
}

const SOCKET_BASE = resolveSocketUrl();

export const walletSocket: Socket = io(`${SOCKET_BASE}/wallet`, {
  transports: ['websocket'],
  autoConnect: false,
});

export function connectWalletSocket(userId: string, token: string): void {
  walletSocket.auth = { token };
  if (!walletSocket.connected) walletSocket.connect();
  walletSocket.emit('joinWallet', { userId });
}

export function disconnectWalletSocket(): void {
  walletSocket.disconnect();
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/features/wallet/lib/
git commit -m "feat(wallet): add web wallet socket client (ARC-615)"
```

### Task 22 — `BalanceChip` Server Component

**Files:**

- Create: `apps/web/src/features/wallet/ui/BalanceChip.tsx`

- [ ] **Step 1: Run `/check-ui-components`**

Audit `@arcadeum/ui` for `Chip`, `Pill`, currency icon. Note what's reusable. If we need to ship a generic `Pill`, add a sub-task to `packages/ui` per `/new-ui-component`.

- [ ] **Step 2: Component**

```tsx
import { Suspense } from 'react';
import { getWalletBalance } from '../server/wallet.server';
import { getTranslations } from '@/shared/i18n/server';
import { CoinIcon, GemIcon, Pill } from '@arcadeum/ui'; // adjust to actual exports
import { WalletLiveBridge } from './WalletLiveBridge';

async function BalanceChipInner() {
  const t = await getTranslations('wallet');
  const balance = await getWalletBalance();
  const fmt = new Intl.NumberFormat();

  return (
    <div className="wallet-balance-chip" aria-label={t('chip.coinsLabel')}>
      <Pill icon={<CoinIcon />} label={fmt.format(balance.coins)} />
      <Pill icon={<GemIcon />} label={fmt.format(balance.gems)} />
      <WalletLiveBridge />
    </div>
  );
}

export function BalanceChip() {
  return (
    <Suspense fallback={<div className="wallet-balance-chip-skeleton" />}>
      <BalanceChipInner />
    </Suspense>
  );
}
```

(Adjust to whatever the project's actual i18n server helper is — confirm via `apps/web/src/shared/i18n/`.)

- [ ] **Step 3: Commit**

### Task 23 — `WalletLiveBridge` client island

**Files:**

- Create: `apps/web/src/features/wallet/ui/WalletLiveBridge.tsx`

- [ ] **Step 1: Component**

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  walletSocket,
  connectWalletSocket,
  disconnectWalletSocket,
} from '../lib/wallet-socket';

interface Props {
  userId: string;
  authToken: string;
}

export function WalletLiveBridge({ userId, authToken }: Props) {
  const router = useRouter();

  useEffect(() => {
    connectWalletSocket(userId, authToken);
    const onUpdate = () => router.refresh();
    walletSocket.on('wallet:updated', onUpdate);
    return () => {
      walletSocket.off('wallet:updated', onUpdate);
      disconnectWalletSocket();
    };
  }, [userId, authToken, router]);

  return null;
}
```

`userId` and `authToken` are passed in from the Server Component parent (which has access via cookies). Update `BalanceChip` to compute and pass these as props.

- [ ] **Step 2: Update `BalanceChip` to pass `userId` + `authToken`**

(Re-confirm the shape of the auth token / where it lives. If access is short-lived or refresh-dependent, this hook may need to re-pull periodically — for ARC-615, a one-off pass on mount is acceptable.)

- [ ] **Step 3: Commit**

### Task 24 — Mount `BalanceChip` in `HeaderInteractive`

**Files:**

- Modify: `apps/web/src/widgets/header/ui/HeaderInteractive.tsx`

- [ ] **Step 1: Import and place inside the existing user-area markup, only when authed**

```tsx
{
  user ? <BalanceChip /> : null;
}
```

- [ ] **Step 2: Manually verify in dev**

```bash
pnpm --filter web dev
```

Open the app, log in, confirm chip renders. Hit `POST /admin/wallet/users/:userId/grant` via curl to verify socket-driven `router.refresh()`.

- [ ] **Step 3: Commit**

### Task 25 — `/wallet` page

**Files:**

- Create: `apps/web/src/app/[locale]/(authed)/wallet/page.tsx`
- Create: `apps/web/src/features/wallet/ui/WalletPageView.tsx`
- Create: `apps/web/src/features/wallet/ui/TransactionRow.tsx`

- [ ] **Step 1: Page**

```tsx
import { getTranslations } from '@/shared/i18n/server';
import {
  getWalletBalance,
  getWalletTransactions,
} from '@/features/wallet/server/wallet.server';
import { WalletPageView } from '@/features/wallet/ui/WalletPageView';
import type { WalletCurrency } from '@/features/wallet/server/wallet.types';
import { WalletLiveBridge } from '@/features/wallet/ui/WalletLiveBridge';

export async function generateMetadata() {
  const t = await getTranslations('wallet');
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

interface SearchParams {
  currency?: string;
  cursor?: string;
}

function parseCurrency(input?: string): WalletCurrency | undefined {
  return input === 'coins' || input === 'gems' ? input : undefined;
}

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const currency = parseCurrency(sp.currency);
  const cursor = sp.cursor;

  const [balance, page] = await Promise.all([
    getWalletBalance(),
    getWalletTransactions({ currency, cursor, limit: 20 }),
  ]);

  return (
    <>
      <WalletPageView balance={balance} page={page} currency={currency} />
      <WalletLiveBridge /* userId, authToken from cookies */ />
    </>
  );
}
```

- [ ] **Step 2: `WalletPageView`** — render summary, filter chips as `<Link>` (preserving cursor=null when filter changes), transaction list, "Next" link with `?cursor=...` when `nextCursor` exists.

- [ ] **Step 3: `TransactionRow`** — pure presentational; takes `WalletTransactionView` and renders `reason` (translated), signed delta (with color), `balanceAfter`, relative timestamp.

- [ ] **Step 4: Vitest** — mock the server module, render the page, assert balance and rows.

- [ ] **Step 5: Commit**

### Task 26 — SEO regression entry

**Files:**

- Modify: existing SEO regression test fixture (find it via `git log --grep=seo` and the recent admin-announcements commit history)

- [ ] **Step 1: Add `/wallet` (per locale) to the SEO meta regression test**

- [ ] **Step 2: Run that test; ensure it passes**

```bash
pnpm --filter web test seo
```

- [ ] **Step 3: Commit**

```bash
git commit -am "test(wallet): cover /wallet in SEO regression (ARC-615)"
```

---

## Phase 7 — Web: admin drawer + server actions

### Task 27 — Server actions

**Files:**

- Create: `apps/web/src/features/admin-wallet/server/wallet.actions.ts`

- [ ] **Step 1: Action implementations**

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod'; // confirm the project uses zod; otherwise use class-validator-equivalent or hand-rolled validation
import {
  type PaginatedWalletTransactions,
  type WalletBalance,
  type WalletTransactionView,
} from '@/features/wallet/server/wallet.types';
import { adminFetch } from '@/features/admin-users/server/admin-fetch'; // reuse existing admin fetch helper if present, else create

const grantSchema = z.object({
  userId: z.string().min(1),
  currency: z.enum(['coins', 'gems']),
  amount: z.number().int().positive().max(1_000_000),
  note: z.string().max(500).optional(),
});

export type WalletActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: 'insufficient' | 'validation' | 'generic';
      details?: unknown;
    };

export async function grantWalletAction(
  input: unknown,
): Promise<WalletActionResult<WalletTransactionView>> {
  const parsed = grantSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: 'validation', details: parsed.error.flatten() };
  const { userId, ...body } = parsed.data;

  const res = await adminFetch(`/admin/wallet/users/${userId}/grant`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (res.status === 422) return { ok: false, error: 'insufficient' };
  if (!res.ok) return { ok: false, error: 'generic' };

  revalidatePath('/admin/users');
  return { ok: true, data: (await res.json()) as WalletTransactionView };
}

// deductWalletAction mirrors grantWalletAction (same schema, different endpoint).

export async function loadAdminWalletAction(
  userId: string,
): Promise<
  WalletActionResult<{
    balance: WalletBalance;
    recent: PaginatedWalletTransactions;
  }>
> {
  const [balanceRes, recentRes] = await Promise.all([
    adminFetch(`/admin/wallet/users/${userId}/balance`),
    adminFetch(`/admin/wallet/users/${userId}/transactions?limit=20`),
  ]);
  if (!balanceRes.ok || !recentRes.ok) return { ok: false, error: 'generic' };
  return {
    ok: true,
    data: {
      balance: await balanceRes.json(),
      recent: await recentRes.json(),
    },
  };
}
```

(If `adminFetch` helper doesn't exist, create one alongside — it just adds the auth header from cookies and routes to the BE.)

- [ ] **Step 2: Vitest** — mocks `adminFetch`, asserts validation rejection, 422 → `insufficient`, success path.

- [ ] **Step 3: Commit**

### Task 28 — `AdminWalletDrawer`

**Files:**

- Create: `apps/web/src/features/admin-wallet/ui/AdminWalletDrawer.tsx`
- Create: `apps/web/src/features/admin-wallet/ui/AdminWalletForm.tsx`

- [ ] **Step 1: Run `/check-ui-components` for `Drawer`, `Sheet`, `Form`, `Input`**

- [ ] **Step 2: Drawer scaffolding (client component)**

```tsx
'use client';
import { useEffect, useState, useTransition } from 'react';
import { loadAdminWalletAction } from '../server/wallet.actions';
import { AdminWalletForm } from './AdminWalletForm';
import { Drawer } from '@arcadeum/ui'; // confirm

interface Props {
  userId: string;
  open: boolean;
  onClose: () => void;
}

export function AdminWalletDrawer({ userId, open, onClose }: Props) {
  const [data, setData] = useState<Awaited<
    ReturnType<typeof loadAdminWalletAction>
  > | null>(null);
  const [, startTransition] = useTransition();

  const reload = () => {
    startTransition(async () => {
      const r = await loadAdminWalletAction(userId);
      setData(r);
    });
  };

  useEffect(() => {
    if (open) reload();
  }, [open, userId]);

  if (!open) return null;

  return (
    <Drawer open={open} onClose={onClose}>
      {/* loading skeleton when data === null */}
      {data?.ok ? (
        <>
          <BalanceSection balance={data.data.balance} />
          <AdminWalletForm userId={userId} onChanged={reload} />
          <RecentSection items={data.data.recent.items} />
        </>
      ) : null}
    </Drawer>
  );
}
```

- [ ] **Step 3: `AdminWalletForm`** — renders currency select, amount input, note textarea, two submit buttons. On click, wraps the corresponding server action in `useTransition`. Surfaces `insufficient` inline; otherwise toasts + calls `onChanged`.

- [ ] **Step 4: Vitest** — render, click grant, assert action was called, assert `insufficient` error rendered when action returns it.

- [ ] **Step 5: Commit**

### Task 29 — Hook drawer into admin-users row

**Files:**

- Modify: `apps/web/src/features/admin-users/ui/AdminUsersTable.tsx` (or whichever file owns the row actions)

- [ ] **Step 1: Add a "Wallet" button per row that opens `AdminWalletDrawer` with that user's id**

Use `useState<{ userId: string } | null>(null)` for which drawer is open; render `<AdminWalletDrawer userId={selected?.userId ?? ''} open={!!selected} onClose={() => setSelected(null)} />` once at the table level.

- [ ] **Step 2: Manually verify the flow end-to-end (BE running, log in as admin, grant 50 coins, confirm header chip on a different tab logged in as the target user)**

- [ ] **Step 3: Commit**

---

## Phase 8 — Mobile

### Task 30 — Mobile API hook

**Files:**

- Create: `apps/mobile/src/features/wallet/api/useWallet.ts`

- [ ] **Step 1: Hooks**

```ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client'; // confirm path

export function useWalletBalance() {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: async () => {
      const res = await apiClient.get<{ coins: number; gems: number }>(
        '/wallet/balance',
      );
      return res.data;
    },
  });
}

export function useWalletTransactions(currency?: 'coins' | 'gems') {
  return useInfiniteQuery({
    queryKey: ['wallet', 'transactions', currency ?? 'all'],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (currency) params.set('currency', currency);
      if (pageParam) params.set('cursor', pageParam);
      params.set('limit', '20');
      const res = await apiClient.get(`/wallet/transactions?${params}`);
      return res.data as {
        items: WalletTransactionView[];
        nextCursor: string | null;
      };
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}
```

- [ ] **Step 2: Jest** — mock `apiClient`, assert hook return shape.

- [ ] **Step 3: Commit**

### Task 31 — Mobile socket hook

**Files:**

- Create: `apps/mobile/src/features/wallet/api/useWalletSocket.ts`

- [ ] **Step 1: Locate the existing mobile socket setup** (`grep -rn "socket\|Socket" apps/mobile/src/shared`)

- [ ] **Step 2: Hook**

```ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  walletSocket,
  connectWalletSocket,
  disconnectWalletSocket,
} from '@/shared/lib/wallet-socket';

export function useWalletSocket(userId: string, token: string) {
  const qc = useQueryClient();
  useEffect(() => {
    connectWalletSocket(userId, token);
    const onUpdate = () => qc.invalidateQueries({ queryKey: ['wallet'] });
    walletSocket.on('wallet:updated', onUpdate);
    return () => {
      walletSocket.off('wallet:updated', onUpdate);
      disconnectWalletSocket();
    };
  }, [userId, token, qc]);
}
```

- [ ] **Step 3: Mount once in `app/(authed)/_layout.tsx`** so the subscription is shared across all tabs/screens.

- [ ] **Step 4: Commit**

### Task 32 — Mobile `BalanceChip` + header mount

**Files:**

- Create: `apps/mobile/src/features/wallet/ui/BalanceChip.tsx`
- Modify: existing mobile header/layout

- [ ] **Step 1: Run `/check-ui-components` for the cross-platform Pill / icon**

- [ ] **Step 2: Implement chip with `useWalletBalance()`**, render skeleton while loading, hide on error.

- [ ] **Step 3: Mount in mobile header**

- [ ] **Step 4: Commit**

### Task 33 — Mobile `/profile/wallet` screen

**Files:**

- Create: `apps/mobile/src/app/(authed)/(tabs)/profile/wallet.tsx`
- Create: `apps/mobile/src/features/wallet/ui/WalletScreenView.tsx`

- [ ] **Step 1: Run `/new-mobile-screen` audit to confirm the right route shape**

- [ ] **Step 2: Screen + view**

Layout: header with title, balance summary, segmented control (All / Coins / Gems) toggling the `useWalletTransactions(currency)` hook, virtualized list (`FlashList` or `FlatList`), `RefreshControl` → `refetch()`, "Load more" tap when `hasNextPage`.

- [ ] **Step 3: Jest snapshot** for the view component.

- [ ] **Step 4: Commit**

### Task 34 — Mobile i18n

**Files:**

- Add wallet keys to the mobile locale files (5 locales)

- [ ] **Step 1: Mirror the web `wallet` namespace keys**
- [ ] **Step 2: Commit**

---

## Phase 9 — E2E

### Task 35 — Playwright: admin grant flow

**Files:**

- Create: `apps/web/e2e/wallet/admin-grant.spec.ts` (path follows existing Playwright structure — confirm with `find apps/web -name "*.spec.ts" -path "*e2e*"`)

- [ ] **Step 1: Test**

```ts
test('admin grant updates the player balance', async ({
  adminPage,
  playerPage,
  browser,
}) => {
  await adminPage.goto('/admin/users');
  await adminPage
    .getByRole('row', { name: /testuser/ })
    .getByRole('button', { name: 'Wallet' })
    .click();
  await adminPage.getByLabel('Currency').selectOption('coins');
  await adminPage.getByLabel('Amount').fill('100');
  await adminPage.getByRole('button', { name: 'Grant' }).click();
  await expect(adminPage.getByText('Done.')).toBeVisible();

  await playerPage.goto('/'); // fresh nav re-renders the SC chip
  await expect(playerPage.getByLabel('Coins')).toContainText('100');
});
```

(Adjust to the project's Playwright fixture/test setup — there may be helper fixtures for `adminPage`/`playerPage` already.)

- [ ] **Step 2: Commit**

### Task 36 — Playwright: wallet page filters + pagination

**Files:**

- Create: `apps/web/e2e/wallet/wallet-page.spec.ts`

- [ ] **Step 1: Test** — seeds the player with 25 coins and 5 gems transactions via `/admin/wallet/...` direct API call in the test setup, then verifies:

  - Default view shows all 30 transactions across 2 pages with the "Next" link.
  - Filter `Coins` → 25 transactions, paginates correctly.
  - URL contains `?currency=coins&cursor=...`.

- [ ] **Step 2: Commit**

### Task 37 — Playwright: socket-driven refresh

**Files:**

- Create: `apps/web/e2e/wallet/socket-update.spec.ts`

- [ ] **Step 1: Test** — open `/wallet` as the player, then issue an admin grant in another browser context, then assert the new transaction appears in the list within ~2s (allow time for socket → `router.refresh()`).

- [ ] **Step 2: Commit**

---

## Phase 10 — Final verification

### Task 38 — Cross-cutting verification

- [ ] **Step 1: Full BE test suite**

```bash
pnpm --filter be test
```

- [ ] **Step 2: Web tests + lint + typecheck**

```bash
pnpm --filter web test
pnpm --filter web typecheck
pnpm --filter web lint
```

- [ ] **Step 3: Mobile tests + lint**

```bash
pnpm --filter mobile test
pnpm --filter mobile lint
```

- [ ] **Step 4: Repo-wide checks**

```bash
pnpm check-file-length
pnpm lint
```

- [ ] **Step 5: Manual smoke test**

- Log in, see chip with `0 / 0`.
- Open admin shell, grant 100 coins to self via drawer — chip updates without page reload (live bridge).
- Open `/wallet` — see transaction.
- Filter coins/gems, paginate.
- Try to deduct more than balance via admin drawer — see inline `insufficient` error.

- [ ] **Step 6: Push branch, open PR**

```bash
git push -u origin ARC-615
# then use /pr-description skill
```

---

## Acceptance criteria

- [ ] `User` schema has `coins` and `gems` fields, both default 0, both `min: 0`.
- [ ] `WalletService` is the only code path that mutates `coins`/`gems` or inserts into `WalletTransaction` (lint rule enforces it).
- [ ] `credit` and `debit` are atomic (Mongo transaction), reject non-positive/non-integer amounts and unknown currencies, are idempotent on `idempotencyKey`, and (for `debit`) throw `InsufficientFundsException` when balance < amount.
- [ ] `wallet:updated` socket event is emitted to the user's room on every successful mutation; never broadcast.
- [ ] Player endpoints `/wallet/balance` and `/wallet/transactions` are guarded by `JwtAuthGuard` and return only the calling user's data.
- [ ] Admin endpoints `/admin/wallet/users/:userId/{balance,transactions,grant,deduct}` are guarded by `JwtAuthGuard` + `RolesGuard` with `@Roles('admin')`.
- [ ] DTOs validated; balance updates from `<=0`, fractional amounts, and amounts > 1_000_000 are rejected with 400.
- [ ] `/wallet` page is a Server Component with cursor-in-URL pagination, filter chips as `<Link>`, and a `<WalletLiveBridge />` causing `router.refresh()` on socket events.
- [ ] Header balance chip is rendered as a Server Component on web and a TanStack-Query-driven component on mobile.
- [ ] Admin drawer on `/admin/users` row supports grant + deduct via server actions, with `insufficient` error shown inline.
- [ ] All 5 locales (en/ru/es/fr/by) updated.
- [ ] BE tests pass: unit + integration (real Mongo replica set).
- [ ] Web tests pass: Vitest + Playwright (3 e2e specs).
- [ ] Mobile tests pass: Jest.
- [ ] No new file exceeds 500 lines (`pnpm check-file-length`).
- [ ] No `any` introduced (`pnpm --filter * typecheck`).
- [ ] ESLint rule active and respected outside the wallet module.
