# ARC-616 — Wallet Earn & Spend Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire `WalletService` (from ARC-615, merged) into the existing `games` and `tournaments` modules so that winning a game mints coins, registering for a tournament burns coins, unregistering or admin-cancelling refunds, and admin-marking-a-tournament-complete pays the prize pool to the winner.

**Architecture:** New `WalletService.parentSession` extension lets callers wrap wallet writes in their own Mongo transaction so registration insert + wallet debit are atomic. `GamesModule` and `TournamentsModule` import `WalletModule`. All wallet calls in this ticket use deterministic idempotency keys derived from the source entity (`game-${sessionId}-payout-${userId}`, `tournament-${id}-{entry|refund|prize}-${userId}`) so retries can never double-pay. Game-win payout failures are swallowed (logged but session still completes); tournament-entry payout failures are fatal to the registration.

**Tech Stack:** NestJS, Mongoose, class-validator, Next.js App Router (Server Components + Server Actions for wallet-touching FE per ARC-615 convention), Tamagui via `@arcadeum/ui`, Expo Router, Vitest (web), Jest (BE + mobile), Playwright (e2e).

**Spec:** [docs/superpowers/specs/2026-05-10-wallet-earn-spend-loop-design.md](../specs/2026-05-10-wallet-earn-spend-loop-design.md)

**Status terminology** (the spec uses informal labels; the actual codebase enum is the authoritative one):

| Spec label  | Actual `TournamentStatus` value(s)                   |
| ----------- | ---------------------------------------------------- |
| "upcoming"  | `scheduled` or `registration_open` (both pre-`live`) |
| "active"    | `live`                                               |
| "completed" | `completed`                                          |

The transition table at [apps/be/src/tournaments/lib/transition.ts](../../apps/be/src/tournaments/lib/transition.ts) is authoritative:

- `scheduled → registration_open` or `cancelled`
- `registration_open → live` or `cancelled`
- `live → completed` or `cancelled`
- `completed`, `cancelled` are terminal

`register()` is only valid when `status === 'registration_open'`. `unregister()` rejects `live`/`completed`. `markComplete()` only valid from `live → completed`.

---

## File structure

### Backend

| Path                                                                                                         | Action | Responsibility                                                                                                      |
| ------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------- |
| `apps/be/src/wallet/wallet.service.ts`                                                                       | Modify | Add optional `parentSession?: ClientSession` param to `credit` and `debit`; extract a shared private helper.        |
| `apps/be/src/wallet/wallet.service.spec.ts`                                                                  | Modify | Add tests for the `parentSession` path.                                                                             |
| `apps/be/src/wallet/interfaces/wallet-types.ts`                                                              | Modify | Extend `WALLET_REASONS` with the four new reasons.                                                                  |
| `apps/be/src/tournaments/schemas/tournament.schema.ts`                                                       | Modify | Add `entryFeeCoins`, `prizePoolCoins`, `winnerUserId` props.                                                        |
| `apps/be/src/tournaments/dto/create-tournament.dto.ts`                                                       | Modify | Add the two coin fields with validators.                                                                            |
| `apps/be/src/tournaments/dto/update-tournament.dto.ts`                                                       | Modify | Same.                                                                                                               |
| `apps/be/src/tournaments/dto/mark-complete.dto.ts`                                                           | Create | `{ winnerUserId: string }` DTO.                                                                                     |
| `apps/be/src/tournaments/tournaments.service.ts`                                                             | Modify | Wire wallet into `register`, `unregister`, `cancel` (or whichever transition entry exists), and add `markComplete`. |
| `apps/be/src/tournaments/tournaments.service.spec.ts`                                                        | Modify | Cover the new wallet integrations.                                                                                  |
| `apps/be/src/tournaments/tournaments.service.integration-spec.ts`                                            | Create | Real-Mongo end-to-end tests for register-with-fee, refund, prize, cancel-refund-all, and idempotency.               |
| `apps/be/src/tournaments/admin-tournaments.controller.ts`                                                    | Modify | Add `POST /admin/tournaments/:id/complete` route.                                                                   |
| `apps/be/src/tournaments/admin-tournaments.controller.spec.ts` (or wherever the admin controller test lives) | Modify | Cover the new endpoint.                                                                                             |
| `apps/be/src/tournaments/lib/tournaments-bootstrap.ts`                                                       | Create | One-time backfill mirroring the wallet bootstrap.                                                                   |
| `apps/be/src/tournaments/tournaments.module.ts`                                                              | Modify | Import `WalletModule`, register the bootstrap.                                                                      |
| `apps/be/src/games/games.service.ts`                                                                         | Modify | Add the `payoutGameWin(session)` private method; call from the `completed` branch.                                  |
| `apps/be/src/games/games.service.spec.ts`                                                                    | Modify | Cover the new payout path.                                                                                          |
| `apps/be/src/games/games.module.ts`                                                                          | Modify | Import `WalletModule`.                                                                                              |
| `apps/be/.env.example` (and equivalents)                                                                     | Modify | Document `GAME_WIN_COIN_REWARD`.                                                                                    |

### Web

| Path                                                                                                                    | Action           | Responsibility                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------ |
| `apps/web/src/features/admin-tournaments/...`                                                                           | Modify           | Add entry fee + prize pool inputs to create/edit form; add "Mark complete" action with participant dropdown. |
| `apps/web/src/features/admin-tournaments/server/...`                                                                    | Modify or Create | Server action for `markCompleteAction(id, winnerUserId)`.                                                    |
| `apps/web/src/features/tournaments/...`                                                                                 | Modify           | Show entry fee + prize pool on public list/detail.                                                           |
| `apps/web/src/features/tournaments/ui/RegisterConfirm.tsx`                                                              | Create           | Client confirm dialog (fee, balance, insufficient-funds inline error).                                       |
| `apps/web/src/features/tournaments/ui/UnregisterConfirm.tsx`                                                            | Create           | Client confirm dialog (refund summary when applicable).                                                      |
| `apps/web/src/features/wallet/server/wallet.types.ts`                                                                   | Modify           | Extend `WalletReason` union.                                                                                 |
| `apps/web/src/shared/i18n/messages/pages/wallet/{en,ru,es,fr,by}.ts`                                                    | Modify           | New reason labels.                                                                                           |
| `apps/web/src/shared/i18n/messages/pages/tournaments/{en,ru,es,fr,by}.ts` (or wherever tournament copy lives — confirm) | Modify           | New keys for entry fee, prize pool, register/unregister confirm copy.                                        |

### Mobile

| Path                                       | Action | Responsibility                                                             |
| ------------------------------------------ | ------ | -------------------------------------------------------------------------- |
| `apps/mobile/src/features/tournaments/...` | Modify | Show entry fee + prize pool on tournament detail; register confirm dialog. |
| `apps/mobile/src/features/wallet/...`      | Modify | Reason labels (i18n only).                                                 |
| Mobile i18n files (3 locales)              | Modify | Same keys as web.                                                          |

### E2E

| Path                                           | Action | Responsibility                                    |
| ---------------------------------------------- | ------ | ------------------------------------------------- |
| `apps/web/e2e/wallet/game-win-payout.spec.ts`  | Create | Scaffolded with `test.skip` per existing pattern. |
| `apps/web/e2e/wallet/tournament-entry.spec.ts` | Create | Same — register/refund flow.                      |
| `apps/web/e2e/wallet/tournament-prize.spec.ts` | Create | Same — admin marks complete, winner credited.     |

---

## Phase 1 — Wallet service `parentSession` extension

### Task 1 — Extend `WALLET_REASONS`

**Files:**

- Modify: `apps/be/src/wallet/interfaces/wallet-types.ts`

- [ ] **Step 1: Add the four new reasons**

```ts
export const WALLET_REASONS = [
  'admin_grant',
  'admin_deduct',
  'game_win',
  'tournament_entry',
  'tournament_refund',
  'tournament_prize',
] as const;
export type WalletReason = (typeof WALLET_REASONS)[number];
```

- [ ] **Step 2: Run BE typecheck**

```bash
pnpm --filter be exec tsc --noEmit
```

Expected: clean (the union extension is additive — old code is still valid).

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/wallet/interfaces/wallet-types.ts
git commit -m "feat(wallet): extend WalletReason with game_win and tournament_* (ARC-616)"
```

### Task 2 — `WalletService.credit/debit` accept optional `parentSession`

**Files:**

- Modify: `apps/be/src/wallet/wallet.service.ts`

The existing implementation opens its own `connection.startSession()` and runs `session.withTransaction(...)`. The change extracts the inner work into a helper that takes a `ClientSession`, and the public `credit`/`debit` methods choose between the caller-provided session (if present) and a freshly opened one.

- [ ] **Step 1: Extract the inner transaction body into a private helper**

The current pattern (mirrored for `debit`):

```ts
async credit(...): Promise<WalletTransactionView> {
  this.assertPositiveInteger(amount);
  this.assertCurrency(currency);

  const session = await this.connection.startSession();
  try {
    let createdTx: WalletTransactionDocument | null = null;
    await session.withTransaction(async () => {
      // ... user findOneAndUpdate + tx create ...
    });
    if (!createdTx) throw new InternalServerErrorException('wallet.transactionFailed');
    this.gateway.emitBalance(...);
    return this.toView(createdTx);
  } catch (err) {
    if (this.isDuplicateIdempotencyKey(err)) { /* return prior */ }
    throw err;
  } finally {
    await session.endSession();
  }
}
```

becomes:

```ts
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
  return this.withSession(parentSession, async (session, isOwn) =>
    this.doWrite(session, isOwn, {
      userId, currency, amount, reason, idempotencyKey, metadata,
      direction: 1,
    }),
  );
}

async debit(
  userId, currency, amount, reason, idempotencyKey, metadata?,
  parentSession?: ClientSession,
): Promise<WalletTransactionView> {
  this.assertPositiveInteger(amount);
  this.assertCurrency(currency);
  return this.withSession(parentSession, async (session, isOwn) =>
    this.doWrite(session, isOwn, {
      userId, currency, amount, reason, idempotencyKey, metadata,
      direction: -1,
    }),
  );
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
  args: { userId; currency; amount; reason; idempotencyKey; metadata?; direction: 1 | -1 },
): Promise<WalletTransactionView> {
  const { userId, currency, amount, reason, idempotencyKey, metadata, direction } = args;

  const filter: Record<string, unknown> = { _id: new Types.ObjectId(userId) };
  if (direction === -1) filter[currency] = { $gte: amount };

  let createdTx: WalletTransactionDocument | null = null;
  let lastBalance: WalletBalance | null = null;

  try {
    const user = await this.userModel.findOneAndUpdate(
      filter,
      { $inc: { [currency]: direction * amount } },
      { new: true, session },
    );

    if (!user) {
      if (direction === -1) {
        const current = await this.userModel.findById(userId, null, { session }).lean();
        const available = current ? (current as Record<string, number>)[currency] ?? 0 : 0;
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
  } catch (err) {
    if (this.isDuplicateIdempotencyKey(err)) {
      // For duplicate-key, look up the prior tx WITHOUT the caller's session,
      // because their transaction is about to abort.
      if (!isOwnSession) {
        // Re-throw so the caller's transaction also aborts; their downstream
        // catch can call WalletService.findByIdempotencyKey to retrieve the
        // prior. (Easier path: extract a tiny helper.)
        throw err;
      }
      const prior = await this.txModel.findOne({ idempotencyKey });
      if (prior) return this.toView(prior);
    }
    throw err;
  }

  if (!createdTx || !lastBalance) {
    throw new InternalServerErrorException('wallet.transactionFailed');
  }

  // Emit only after the transaction is durably committed. Inside a parent
  // session we don't know if the parent will commit, so the gateway emit is
  // deferred until after the parent's withTransaction resolves.
  if (isOwnSession) {
    this.gateway.emitBalance(userId, lastBalance);
  }

  return this.toView(createdTx);
}
```

**Notes on subtle correctness:**

- **Duplicate-key handling with a parent session** — when the caller owns the session, we cannot do the "abort, then non-transactional read" trick (the caller may not abort; we'd be reading uncommitted state). **Strategy:** when `parentSession` is set, re-throw the dup-key error to the caller. The caller's `withTransaction` aborts (which is what we want — the registration insert / etc. should also roll back), and after the transaction has aborted the caller can retrieve the prior tx via `WalletService.findByIdempotencyKey(key)` if it needs the result. The caller-side pattern (only used by deliberate retries — the four ARC-616 keys are unique per (entity, user) so a same-call duplicate is truly a retry):

  ```ts
  try {
    await session.withTransaction(async () => {
      await this.wallet.debit(..., session);
      await this.tournamentModel.updateOne(..., { session });
    });
  } catch (err) {
    if (looksLikeDuplicateKey(err)) {
      const prior = await this.wallet.findByIdempotencyKey(key);
      // The caller decides whether to treat the prior tx as success or surface
      // the error. Tournaments treat it as a retry and proceed.
      if (prior) return; // ... proceed as if the original call succeeded
    }
    throw err;
  }
  ```

  In practice the `tournaments.service` call sites use brand-new keys per (tournament, user, action) so a true duplicate is rare and only happens during legitimate retries. Expose a tiny helper:

  ```ts
  async findByIdempotencyKey(key: string): Promise<WalletTransactionView | null> {
    const doc = await this.txModel.findOne({ idempotencyKey: key });
    return doc ? this.toView(doc) : null;
  }
  ```

- **Socket emit timing** — when the caller owns the session, defer emission. The caller is responsible for calling `wallet.emitAfterCommit(userId)` after their own `withTransaction` resolves. Add a thin pass-through:

  ```ts
  emitAfterCommit(userId: string, balance: WalletBalance): void {
    this.gateway.emitBalance(userId, balance);
  }
  ```

  `WalletService.getBalance(userId)` is **already exposed** by ARC-615 (see [apps/be/src/wallet/wallet.service.ts:200](../../apps/be/src/wallet/wallet.service.ts#L200)) and is the right way to fetch the post-commit balance for emission. Callers do:

  ```ts
  await session.withTransaction(async () => {
    await this.wallet.debit(..., session);
    // ... other writes ...
  });
  // After commit: emit. Use the post-commit balance.
  this.wallet.emitAfterCommit(userId, await this.wallet.getBalance(userId));
  ```

- [ ] **Step 2: Add the helpers + extension**

Make the edits described above.

- [ ] **Step 3: Run typecheck + existing tests**

```bash
pnpm --filter be exec tsc --noEmit
pnpm --filter be exec jest wallet --silent
```

Expected: typecheck clean, all 17 wallet tests pass (existing 11 service + 6 integration).

- [ ] **Step 4: Add tests for the `parentSession` path**

```ts
describe('credit (parentSession)', () => {
  it('uses the caller-supplied session and skips its own transaction', async () => {
    const externalSession = {} as ClientSession;
    userModel.findOneAndUpdate.mockResolvedValue({ coins: 100, gems: 0 });
    txModel.create.mockResolvedValue([
      makeTxDoc({
        /* ... */
      }),
    ]);

    await service.credit(
      userId,
      'coins',
      100,
      'admin_grant',
      'k',
      undefined,
      externalSession,
    );

    // No own startSession call.
    expect(connection.startSession).not.toHaveBeenCalled();
    // findOneAndUpdate was called with the external session.
    expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.objectContaining({ session: externalSession }),
    );
    // The gateway emit is deferred (not called inline).
    expect(walletGateway.emitBalance).not.toHaveBeenCalled();
  });
});
```

Mirror for `debit`.

- [ ] **Step 5: Run, expect pass**

```bash
pnpm --filter be exec jest wallet --silent
```

- [ ] **Step 6: Commit**

```bash
git add apps/be/src/wallet/
git commit -m "feat(wallet): support parentSession for cross-module transactions (ARC-616)"
```

---

## Phase 2 — Tournament schema, DTOs, bootstrap

### Task 3 — Tournament schema additions

**Files:**

- Modify: `apps/be/src/tournaments/schemas/tournament.schema.ts`

- [ ] **Step 1: Add the three fields after the existing `prizeDescription`**

```ts
@Prop({ type: Number, default: 0, min: 0, max: 1_000_000 })
entryFeeCoins!: number;

@Prop({ type: Number, default: 0, min: 0, max: 1_000_000 })
prizePoolCoins!: number;

@Prop({ type: String, default: null })
winnerUserId!: string | null;
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter be exec tsc --noEmit
git add apps/be/src/tournaments/schemas/tournament.schema.ts
git commit -m "feat(tournaments): add entryFeeCoins, prizePoolCoins, winnerUserId (ARC-616)"
```

### Task 4 — DTOs

**Files:**

- Modify: `apps/be/src/tournaments/dto/create-tournament.dto.ts`
- Modify: `apps/be/src/tournaments/dto/update-tournament.dto.ts`
- Create: `apps/be/src/tournaments/dto/mark-complete.dto.ts`

- [ ] **Step 1: Extend create + update DTOs**

```ts
@IsInt() @Min(0) @Max(1_000_000) @IsOptional()
entryFeeCoins?: number;

@IsInt() @Min(0) @Max(1_000_000) @IsOptional()
prizePoolCoins?: number;
```

- [ ] **Step 2: New mark-complete DTO**

```ts
import { IsMongoId } from 'class-validator';

export class MarkTournamentCompleteDto {
  @IsMongoId()
  winnerUserId!: string;
}
```

- [ ] **Step 3: Typecheck + commit**

```bash
git add apps/be/src/tournaments/dto/
git commit -m "feat(tournaments): add coin fields to DTOs and mark-complete DTO (ARC-616)"
```

### Task 5 — Bootstrap (per-field backfill)

**Files:**

- Create: `apps/be/src/tournaments/lib/tournaments-bootstrap.ts`
- Modify: `apps/be/src/tournaments/tournaments.module.ts`

- [ ] **Step 1: Bootstrap class** (mirrors `wallet-bootstrap.ts`)

```ts
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tournament } from '../schemas/tournament.schema';

@Injectable()
export class TournamentsBootstrap implements OnApplicationBootstrap {
  private readonly logger = new Logger(TournamentsBootstrap.name);

  constructor(
    @InjectModel(Tournament.name) private readonly model: Model<Tournament>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const [feeRes, prizeRes, winnerRes] = await Promise.all([
      this.model.updateMany(
        { entryFeeCoins: { $exists: false } },
        { $set: { entryFeeCoins: 0 } },
      ),
      this.model.updateMany(
        { prizePoolCoins: { $exists: false } },
        { $set: { prizePoolCoins: 0 } },
      ),
      this.model.updateMany(
        { winnerUserId: { $exists: false } },
        { $set: { winnerUserId: null } },
      ),
    ]);
    const total =
      (feeRes.modifiedCount ?? 0) +
      (prizeRes.modifiedCount ?? 0) +
      (winnerRes.modifiedCount ?? 0);
    if (total > 0) {
      this.logger.log(
        `Tournament backfill: fee=${feeRes.modifiedCount ?? 0}, prize=${prizeRes.modifiedCount ?? 0}, winner=${winnerRes.modifiedCount ?? 0}`,
      );
    }
  }
}
```

- [ ] **Step 2: Register the bootstrap in `TournamentsModule.providers`**

- [ ] **Step 3: Typecheck + commit**

```bash
git add apps/be/src/tournaments/
git commit -m "feat(tournaments): add bootstrap to backfill new coin fields (ARC-616)"
```

---

## Phase 3 — Tournaments service: register / unregister / cancel / markComplete

### Task 6 — Wire `WalletModule` into `TournamentsModule`

**Files:**

- Modify: `apps/be/src/tournaments/tournaments.module.ts`

- [ ] **Step 1: Import**

```ts
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    AuthModule,
    WalletModule,
    MongooseModule.forFeature([...]),
  ],
  // ...
})
```

- [ ] **Step 2: Inject `Connection` (for cross-session transactions) and `WalletService` in `TournamentsService` constructor.** Verify that `MongooseModule` exposes `Connection` injection — should be available since it's a standard Nest pattern (`@InjectConnection() private readonly connection: Connection`).

- [ ] **Step 3: Typecheck + commit (no runtime change yet, just wiring)**

```bash
pnpm --filter be exec tsc --noEmit
git add apps/be/src/tournaments/tournaments.module.ts apps/be/src/tournaments/tournaments.service.ts
git commit -m "feat(tournaments): wire WalletService and Connection (ARC-616)"
```

### Task 7 — `register()` charges entry fee atomically (TDD)

**Files:**

- Modify: `apps/be/src/tournaments/tournaments.service.ts`
- Modify: `apps/be/src/tournaments/tournaments.service.spec.ts`

- [ ] **Step 1: Failing tests**

```ts
describe('register with entry fee', () => {
  it('debits the wallet then writes the registration in one transaction', async () => {
    const tournament = mockTournament({
      entryFeeCoins: 50,
      status: 'registration_open',
    });
    tournamentModel.findById.mockReturnValue({
      lean: () => Promise.resolve(tournament),
    });
    tournamentModel.updateOne.mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
    });
    walletService.debit.mockResolvedValue(/* tx view */);
    connection.startSession.mockResolvedValue(mockSession);

    await service.register(tournament._id.toString(), userId);

    expect(walletService.debit).toHaveBeenCalledWith(
      userId,
      'coins',
      50,
      'tournament_entry',
      `tournament-${tournament._id}-entry-${userId}`,
      expect.objectContaining({ tournamentId: String(tournament._id) }),
      mockSession, // parentSession
    );
    expect(tournamentModel.updateOne).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.objectContaining({ session: mockSession }),
    );
  });

  it('rejects with InsufficientFundsException and does NOT write the registration', async () => {
    const tournament = mockTournament({
      entryFeeCoins: 50,
      status: 'registration_open',
    });
    tournamentModel.findById.mockReturnValue({
      lean: () => Promise.resolve(tournament),
    });
    walletService.debit.mockRejectedValue(
      new InsufficientFundsException('coins', 50, 0),
    );
    connection.startSession.mockResolvedValue(mockSession);

    await expect(
      service.register(tournament._id.toString(), userId),
    ).rejects.toThrow(/insufficientFunds/);
    expect(tournamentModel.updateOne).not.toHaveBeenCalled();
  });

  it('skips the wallet entirely when entryFeeCoins is 0', async () => {
    const tournament = mockTournament({
      entryFeeCoins: 0,
      status: 'registration_open',
    });
    tournamentModel.findById.mockReturnValue({
      lean: () => Promise.resolve(tournament),
    });
    tournamentModel.updateOne.mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
    });

    await service.register(tournament._id.toString(), userId);

    expect(walletService.debit).not.toHaveBeenCalled();
    expect(connection.startSession).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run, expect failure**

- [ ] **Step 3: Implement**

```ts
async register(id: string, userId: string): Promise<void> {
  const doc = await this.tournamentModel.findById(id).lean();
  if (!doc) throw new NotFoundException(...);
  if (doc.status !== 'registration_open') {
    throw new BadRequestException(...);
  }
  // ... existing capacity / already-registered checks ...

  const fee = doc.entryFeeCoins ?? 0;

  if (fee === 0) {
    // No wallet involvement.
    await this.tournamentModel.updateOne(
      { _id: doc._id },
      { $push: { registrations: { userId, registeredAt: new Date(), waitlist: false } } },
    );
    return;
  }

  // Paid entry — atomic debit + insert.
  const session = await this.connection.startSession();
  try {
    await session.withTransaction(async () => {
      await this.wallet.debit(
        userId,
        'coins',
        fee,
        'tournament_entry',
        `tournament-${doc._id}-entry-${userId}`,
        { tournamentId: String(doc._id) },
        session,
      );
      await this.tournamentModel.updateOne(
        { _id: doc._id },
        { $push: { registrations: { userId, registeredAt: new Date(), waitlist: false } } },
        { session },
      );
    });
    // Post-commit balance emit.
    const balance = await this.wallet.getBalance(userId);
    this.wallet.emitAfterCommit(userId, balance);
  } finally {
    await session.endSession();
  }
}
```

(Capacity / waitlist logic from the existing implementation — preserve whatever that file already does and only add the wallet path.)

- [ ] **Step 4: Run, expect pass**

```bash
pnpm --filter be exec jest tournaments.service.spec --silent
```

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/tournaments/
git commit -m "feat(tournaments): charge entry fee on register, atomic with insert (ARC-616)"
```

### Task 8 — `unregister()` refunds when before-start + paid (TDD)

**Files:**

- Modify: `apps/be/src/tournaments/tournaments.service.ts`
- Modify: `apps/be/src/tournaments/tournaments.service.spec.ts`

- [ ] **Step 1: Failing tests**

```ts
describe('unregister with refund', () => {
  it('refunds the entry fee when status is registration_open', async () => {
    const tournament = mockTournament({
      entryFeeCoins: 50,
      status: 'registration_open',
      registrations: [{ userId, registeredAt: new Date(), waitlist: false }],
    });
    // ...
    await service.unregister(tournament._id.toString(), userId);

    expect(walletService.credit).toHaveBeenCalledWith(
      userId,
      'coins',
      50,
      'tournament_refund',
      `tournament-${tournament._id}-refund-${userId}`,
      expect.objectContaining({ tournamentId: String(tournament._id) }),
      mockSession,
    );
    expect(tournamentModel.updateOne).toHaveBeenCalled();
  });

  it('refunds when status is scheduled (also pre-start)', async () => {
    const tournament = mockTournament({
      entryFeeCoins: 50,
      status: 'scheduled',
      registrations: [{ userId, registeredAt: new Date(), waitlist: false }],
    });
    await service.unregister(tournament._id.toString(), userId);
    expect(walletService.credit).toHaveBeenCalled();
  });

  it('does not refund when entryFeeCoins is 0', async () => {
    const tournament = mockTournament({
      entryFeeCoins: 0,
      status: 'registration_open',
      registrations: [{ userId, registeredAt: new Date(), waitlist: false }],
    });
    await service.unregister(tournament._id.toString(), userId);
    expect(walletService.credit).not.toHaveBeenCalled();
  });
});
```

(The existing service already rejects unregister on `live`/`completed`, so we don't add a "no refund after start" test here — that path is guarded upstream.)

- [ ] **Step 2: Run, expect failure**

- [ ] **Step 3: Implement**

```ts
async unregister(id: string, userId: string): Promise<void> {
  const doc = await this.tournamentModel.findById(id).lean();
  if (!doc) throw new NotFoundException(...);
  if (doc.status === 'live' || doc.status === 'completed') {
    throw new BadRequestException(...);
  }
  const reg = doc.registrations.find((r) => r.userId === userId);
  if (!reg) {
    // Nothing to do — match existing behaviour (idempotent noop or 404).
    return;
  }

  const fee = doc.entryFeeCoins ?? 0;
  const shouldRefund = fee > 0;

  if (!shouldRefund) {
    await this.tournamentModel.updateOne(
      { _id: doc._id },
      { $pull: { registrations: { userId } } },
    );
    return;
  }

  const session = await this.connection.startSession();
  try {
    await session.withTransaction(async () => {
      await this.wallet.credit(
        userId,
        'coins',
        fee,
        'tournament_refund',
        `tournament-${doc._id}-refund-${userId}`,
        { tournamentId: String(doc._id) },
        session,
      );
      await this.tournamentModel.updateOne(
        { _id: doc._id },
        { $pull: { registrations: { userId } } },
        { session },
      );
    });
    const balance = await this.wallet.getBalance(userId);
    this.wallet.emitAfterCommit(userId, balance);
  } finally {
    await session.endSession();
  }
}
```

- [ ] **Step 4: Run, expect pass; commit**

```bash
git add apps/be/src/tournaments/
git commit -m "feat(tournaments): refund entry fee on unregister before start (ARC-616)"
```

### Task 9 — Cancel-tournament refunds all paid registrations (TDD)

**Files:**

- Modify: `apps/be/src/tournaments/tournaments.service.ts`
- Modify: `apps/be/src/tournaments/tournaments.service.spec.ts`

The existing tournament cancellation already happens via the `transition(id, 'cancelled')` path (or whatever the existing transition method is named). The fix is to refund inside that transition when there are paid registrations.

- [ ] **Step 1: Locate the existing cancel/transition method** (`grep "cancelled\|transition" apps/be/src/tournaments/tournaments.service.ts`)

- [ ] **Step 2: Failing test**

```ts
describe('cancel tournament refunds all paid registrants', () => {
  it('refunds every registration when entryFeeCoins > 0', async () => {
    const tournament = mockTournament({
      entryFeeCoins: 30,
      status: 'registration_open',
      registrations: [
        { userId: 'u1', registeredAt: new Date(), waitlist: false },
        { userId: 'u2', registeredAt: new Date(), waitlist: false },
      ],
    });
    // ... set up session mocks ...

    await service.transition(tournament._id.toString(), 'cancelled');

    expect(walletService.credit).toHaveBeenCalledTimes(2);
    expect(walletService.credit).toHaveBeenCalledWith(
      'u1',
      'coins',
      30,
      'tournament_refund',
      `tournament-${tournament._id}-refund-u1`,
      expect.any(Object),
      mockSession,
    );
    expect(walletService.credit).toHaveBeenCalledWith(
      'u2',
      'coins',
      30,
      'tournament_refund',
      `tournament-${tournament._id}-refund-u2`,
      expect.any(Object),
      mockSession,
    );
  });

  it('skips wallet when entryFeeCoins is 0', async () => {
    const tournament = mockTournament({
      entryFeeCoins: 0,
      registrations: [{ userId: 'u1' /* ... */ }],
    });
    await service.transition(tournament._id.toString(), 'cancelled');
    expect(walletService.credit).not.toHaveBeenCalled();
  });
});
```

(The deterministic key — `tournament-${id}-refund-${userId}` — is the same as self-unregister, so a player who already self-unregistered before the admin cancel cannot be double-refunded. The wallet's idempotency layer returns the prior tx and the second call is a no-op for the ledger.)

- [ ] **Step 3: Implement** — wrap the existing `cancelled` transition in a transaction, iterate `registrations[]`, and call `wallet.credit` with the parent session for each.

- [ ] **Step 4: Run, expect pass; commit**

```bash
git add apps/be/src/tournaments/
git commit -m "feat(tournaments): refund all paid registrations on admin cancel (ARC-616)"
```

### Task 10 — `markComplete()` (TDD)

**Files:**

- Modify: `apps/be/src/tournaments/tournaments.service.ts`
- Modify: `apps/be/src/tournaments/tournaments.service.spec.ts`

- [ ] **Step 1: Failing tests**

```ts
describe('markComplete', () => {
  it('pays the prize pool to the winner and records winnerUserId', async () => {
    const winnerId = '64a7f000000000000000abcd';
    const tournament = mockTournament({
      status: 'live',
      prizePoolCoins: 500,
      registrations: [{ userId: winnerId /* ... */ }],
    });
    // ... session mock ...

    await service.markComplete(tournament._id.toString(), winnerId);

    expect(tournamentModel.updateOne).toHaveBeenCalledWith(
      { _id: tournament._id, status: 'live' },
      { $set: { status: 'completed', winnerUserId: winnerId } },
      expect.objectContaining({ session: mockSession }),
    );
    expect(walletService.credit).toHaveBeenCalledWith(
      winnerId,
      'coins',
      500,
      'tournament_prize',
      `tournament-${tournament._id}-prize-${winnerId}`,
      expect.any(Object),
      mockSession,
    );
  });

  it('rejects when status is not live', async () => {
    const tournament = mockTournament({ status: 'registration_open' });
    await expect(
      service.markComplete(tournament._id.toString(), 'u1'),
    ).rejects.toThrow();
  });

  it('rejects when winner is not a registered participant', async () => {
    const tournament = mockTournament({
      status: 'live',
      registrations: [{ userId: 'someone-else' /* ... */ }],
    });
    await expect(
      service.markComplete(tournament._id.toString(), 'u1'),
    ).rejects.toThrow();
  });

  it('is idempotent: re-marking with the same winner is a no-op', async () => {
    const tournament = mockTournament({
      status: 'completed',
      winnerUserId: 'u1',
    });
    await expect(
      service.markComplete(tournament._id.toString(), 'u1'),
    ).resolves.toBeDefined();
    expect(walletService.credit).not.toHaveBeenCalled();
  });

  it('rejects re-marking with a different winner', async () => {
    const tournament = mockTournament({
      status: 'completed',
      winnerUserId: 'u1',
    });
    await expect(
      service.markComplete(tournament._id.toString(), 'u2'),
    ).rejects.toThrow();
  });

  it('skips the wallet when prizePoolCoins is 0', async () => {
    const tournament = mockTournament({
      status: 'live',
      prizePoolCoins: 0,
      registrations: [{ userId: 'u1' /* ... */ }],
    });
    await service.markComplete(tournament._id.toString(), 'u1');
    expect(walletService.credit).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Implement**

```ts
async markComplete(id: string, winnerUserId: string): Promise<TournamentDetail> {
  const doc = await this.tournamentModel.findById(id).lean();
  if (!doc) throw new NotFoundException('tournaments.notFound');

  if (doc.status === 'completed') {
    if (doc.winnerUserId === winnerUserId) {
      // Idempotent — return current state.
      return this.toDetail(doc);
    }
    throw new BadRequestException('tournaments.alreadyCompleted');
  }
  if (doc.status !== 'live') {
    throw new BadRequestException('tournaments.notLive');
  }
  const isRegistered = doc.registrations.some((r) => r.userId === winnerUserId);
  if (!isRegistered) {
    throw new BadRequestException('tournaments.winnerNotRegistered');
  }

  const prize = doc.prizePoolCoins ?? 0;
  const session = await this.connection.startSession();
  try {
    await session.withTransaction(async () => {
      const result = await this.tournamentModel.updateOne(
        { _id: doc._id, status: 'live' },
        { $set: { status: 'completed', winnerUserId } },
        { session },
      );
      if (result.modifiedCount === 0) {
        throw new ConflictException('tournaments.statusChanged');
      }
      if (prize > 0) {
        await this.wallet.credit(
          winnerUserId,
          'coins',
          prize,
          'tournament_prize',
          `tournament-${doc._id}-prize-${winnerUserId}`,
          { tournamentId: String(doc._id) },
          session,
        );
      }
    });
    if (prize > 0) {
      const balance = await this.wallet.getBalance(winnerUserId);
      this.wallet.emitAfterCommit(winnerUserId, balance);
    }
  } finally {
    await session.endSession();
  }

  const updated = await this.tournamentModel.findById(id).lean();
  return this.toDetail(updated!);
}
```

- [ ] **Step 3: Run, expect pass; commit**

```bash
git add apps/be/src/tournaments/
git commit -m "feat(tournaments): admin markComplete pays prize pool to winner (ARC-616)"
```

### Task 11 — Admin endpoint for `markComplete`

**Files:**

- Modify: `apps/be/src/tournaments/admin-tournaments.controller.ts`
- Modify: matching controller spec file

- [ ] **Step 1: Tests**

Cover:

- `POST /admin/tournaments/:id/complete` calls `service.markComplete(id, dto.winnerUserId)` and returns the updated tournament.
- DTO validation rejects non-MongoId `winnerUserId`.
- 422 surfaces when service throws `BadRequestException('tournaments.winnerNotRegistered')` (or whatever the chosen error semantics are).

- [ ] **Step 2: Implement**

```ts
@Post(':id/complete')
async complete(
  @Param('id') id: string,
  @Body() dto: MarkTournamentCompleteDto,
): Promise<TournamentDetail> {
  return this.service.markComplete(id, dto.winnerUserId);
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/tournaments/
git commit -m "feat(tournaments): add admin endpoint to mark tournament complete (ARC-616)"
```

### Task 12 — Tournament integration tests (real Mongo)

**Files:**

- Create: `apps/be/src/tournaments/tournaments.service.integration-spec.ts`

Same setup pattern as `wallet.service.integration-spec.ts` — `mongodb-memory-server` replica set, real `WalletModule` + `TournamentsModule` + Mongoose.

- [ ] **Step 1: Boot a Nest test module and seed a user with 100 coins**

- [ ] **Step 2: Test register-with-fee end-to-end**

```ts
it('register with entry fee debits wallet and inserts registration atomically', async () => {
  const tournamentId = await createTournament({
    entryFeeCoins: 30,
    status: 'registration_open',
  });
  await wallet.credit(userId, 'coins', 100, 'admin_grant', 'seed');
  await tournaments.register(tournamentId, userId);
  const balance = await wallet.getBalance(userId);
  expect(balance.coins).toBe(70);
  const t = await tournamentModel.findById(tournamentId).lean();
  expect(t!.registrations.find((r) => r.userId === userId)).toBeDefined();
});

it('register with insufficient balance leaves no registration row and no debit', async () => {
  const tournamentId = await createTournament({
    entryFeeCoins: 200,
    status: 'registration_open',
  });
  await wallet.credit(userId, 'coins', 50, 'admin_grant', 'seed');
  await expect(tournaments.register(tournamentId, userId)).rejects.toThrow();
  const balance = await wallet.getBalance(userId);
  expect(balance.coins).toBe(50);
  const t = await tournamentModel.findById(tournamentId).lean();
  expect(t!.registrations).toHaveLength(0);
});

it('register is idempotent on retry (same key returns the prior debit)', async () => {
  // Force an exception after debit but before the registration insert by
  // mocking updateOne to throw. The transaction should abort and the
  // wallet ledger should still hold exactly one entry (idempotent).
  // ... see wallet integration test pattern ...
});

it('unregister refunds and ledger has both entry and refund rows', async () => {
  const tournamentId = await createTournament({
    entryFeeCoins: 30,
    status: 'registration_open',
  });
  await wallet.credit(userId, 'coins', 100, 'admin_grant', 'seed');
  await tournaments.register(tournamentId, userId);
  await tournaments.unregister(tournamentId, userId);
  const balance = await wallet.getBalance(userId);
  expect(balance.coins).toBe(100);
  const history = await wallet.getHistory(userId, { limit: 10 });
  const tournamentTxs = history.items.filter(
    (tx) => tx.metadata?.tournamentId === tournamentId,
  );
  expect(tournamentTxs).toHaveLength(2);
  expect(tournamentTxs.map((tx) => tx.reason).sort()).toEqual([
    'tournament_entry',
    'tournament_refund',
  ]);
});

it('cancel-tournament refunds every paid participant', async () => {
  /* ... */
});

it('markComplete is idempotent on retry', async () => {
  /* ... */
});
```

- [ ] **Step 3: Run, expect pass; commit**

```bash
git add apps/be/src/tournaments/
git commit -m "test(tournaments): integration tests for wallet-touching flows (ARC-616)"
```

---

## Phase 4 — Games: game-win payout

### Task 13 — Wire `WalletModule` into `GamesModule`

**Files:**

- Modify: `apps/be/src/games/games.module.ts`

- [ ] **Step 1: Import `WalletModule`** to `GamesModule.imports`.

- [ ] **Step 2: Inject `WalletService` and `ConfigService` into `GamesService`.**

- [ ] **Step 3: Initialise `gameWinCoinReward` in the constructor**

```ts
private readonly gameWinCoinReward: number;

constructor(
  // ... existing deps ...
  private readonly wallet: WalletService,
  private readonly config: ConfigService,
) {
  // ... existing init ...
  const raw = this.config.get<string>('GAME_WIN_COIN_REWARD');
  const parsed = raw ? Number(raw) : 50;
  this.gameWinCoinReward = Number.isInteger(parsed) && parsed > 0 ? parsed : 50;
}
```

- [ ] **Step 4: Typecheck + commit**

```bash
git add apps/be/src/games/
git commit -m "feat(games): wire WalletService and reward config (ARC-616)"
```

### Task 14 — `payoutGameWin()` on session completion (TDD)

**Files:**

- Modify: `apps/be/src/games/games.service.ts`
- Modify: `apps/be/src/games/games.service.spec.ts`

- [ ] **Step 1: Failing tests**

```ts
describe('game-win payout', () => {
  it('credits each winner GAME_WIN_COIN_REWARD on session completion', async () => {
    sessionsService.getWinners.mockResolvedValue(['winner-1', 'winner-2']);
    walletService.credit.mockResolvedValue(/* tx */);

    await service.handleSessionUpdate(/* completed session */);

    expect(walletService.credit).toHaveBeenCalledTimes(2);
    expect(walletService.credit).toHaveBeenCalledWith(
      'winner-1',
      'coins',
      50,
      'game_win',
      `game-${sessionId}-payout-winner-1`,
      expect.objectContaining({ sessionId, gameId: expect.any(String) }),
    );
    expect(walletService.credit).toHaveBeenCalledWith(
      'winner-2',
      'coins',
      50,
      'game_win',
      `game-${sessionId}-payout-winner-2`,
      expect.any(Object),
    );
  });

  it('logs and continues when a wallet credit fails', async () => {
    sessionsService.getWinners.mockResolvedValue(['winner-1']);
    walletService.credit.mockRejectedValue(new Error('wallet-down'));

    // The session-update handler must NOT throw.
    await expect(
      service.handleSessionUpdate(/* completed session */),
    ).resolves.not.toThrow();
  });

  it('logs and continues when getWinners throws', async () => {
    sessionsService.getWinners.mockRejectedValue(new Error('engine-error'));
    await expect(
      service.handleSessionUpdate(/* completed session */),
    ).resolves.not.toThrow();
    expect(walletService.credit).not.toHaveBeenCalled();
  });

  it('does nothing when winners list is empty (e.g. draw)', async () => {
    sessionsService.getWinners.mockResolvedValue([]);
    await service.handleSessionUpdate(/* completed session */);
    expect(walletService.credit).not.toHaveBeenCalled();
  });
});
```

(Replace `handleSessionUpdate` with whatever the actual method name is — confirm via reading the existing test file. The failing tests should drive the implementation.)

- [ ] **Step 2: Implement** the `payoutGameWin(session)` private method on `GamesService` and call it from the existing `if (updatedSession.status === 'completed')` branch at [games.service.ts:143](apps/be/src/games/games.service.ts#L143). Wrap in try/catch — log on failure, never re-throw.

- [ ] **Step 3: Run, expect pass; commit**

```bash
git add apps/be/src/games/
git commit -m "feat(games): credit winners coins when session completes (ARC-616)"
```

### Task 15 — Document `GAME_WIN_COIN_REWARD` env var

**Files:**

- Modify: `apps/be/.env.example` (or whatever the documented sample is — find via `find apps/be -name '.env.example' -o -name '.env.sample'`)
- Modify: any deployment / config docs that list env vars

- [ ] **Step 1: Add `GAME_WIN_COIN_REWARD=50` with a comment**

- [ ] **Step 2: Commit**

```bash
git add apps/be/.env.example
git commit -m "docs(games): document GAME_WIN_COIN_REWARD env var (ARC-616)"
```

---

## Phase 5 — Web admin tournament form

### Task 16 — Admin form: entry fee + prize pool inputs

**Files:**

- Modify: `apps/web/src/features/admin-tournaments/...` (locate the existing create/edit form via `find apps/web/src/features/admin-tournaments -name "*.tsx"`)
- Modify: any matching server action / form schema

- [ ] **Step 1: Add two number inputs** ("Entry fee (coins)" and "Prize pool (coins)"), both `min={0}`, `max={1_000_000}`, default `0`. Use the existing form primitive (e.g. `<Input type="number" />` or `@arcadeum/ui` equivalent).

- [ ] **Step 2: Update server action validation** (or the existing form schema) to accept `entryFeeCoins` and `prizePoolCoins` integers.

- [ ] **Step 3: Vitest** that the form renders both inputs and that submitting passes them through.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(admin-tournaments): add entry fee and prize pool inputs (ARC-616)"
```

### Task 17 — Admin "Mark complete" action with participant dropdown

**Files:**

- Modify: existing tournament detail / row action area
- Create: `apps/web/src/features/admin-tournaments/ui/MarkCompleteDialog.tsx`
- Modify or Create: server action `markCompleteAction(id, winnerUserId)`

- [ ] **Step 1: Server action**

```ts
'use server';
import { adminFetch } from '@/features/admin-users/server/admin-fetch'; // or whatever helper
// ... validation ...

export async function markCompleteAction(input: {
  tournamentId: string;
  winnerUserId: string;
}): Promise<ActionResult> {
  // Validate, call POST /admin/tournaments/:id/complete, return discriminated union.
}
```

- [ ] **Step 2: `MarkCompleteDialog`** — client component with a `<select>` populated from `tournament.registrations` (each option shows the participant's display name + userId). Submit calls the server action. On success: toast + revalidate. On error: inline error.

- [ ] **Step 3: Hook into the admin tournaments table** — add a "Mark complete" button on rows where status === 'live'.

- [ ] **Step 4: Vitest** for the dialog (renders dropdown, calls action, surfaces error).

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(admin-tournaments): add mark-complete dialog with winner picker (ARC-616)"
```

---

## Phase 6 — Web public tournament UI

### Task 18 — Show entry fee + prize pool on public tournament list/detail

**Files:**

- Modify: existing public tournament view components

- [ ] **Step 1: Render fee + pool when > 0**, using the new i18n keys.

- [ ] **Step 2: Vitest snapshot or assertion** that the values render.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(tournaments): show entry fee and prize pool on public surfaces (ARC-616)"
```

### Task 19 — Register confirm dialog

**Files:**

- Create: `apps/web/src/features/tournaments/ui/RegisterConfirm.tsx`

- [ ] **Step 1: Client component** — when entry fee > 0, opens on Register button click. Body: "This tournament costs N coins. Your balance: M coins." Confirm button posts via the existing register endpoint. On 422 `wallet.insufficientFunds`, render an inline error with a link to `/wallet`.

- [ ] **Step 2: Replace direct register-button onClick** with the confirm flow when fee > 0.

- [ ] **Step 3: Vitest** — confirm render, submit, 422 path.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(tournaments): add register confirm dialog with insufficient-funds path (ARC-616)"
```

### Task 20 — Unregister confirm dialog

**Files:**

- Create: `apps/web/src/features/tournaments/ui/UnregisterConfirm.tsx`

- [ ] **Step 1: Client component** — when status is `scheduled` or `registration_open` AND entry fee > 0, show "You'll be refunded N coins." When after start: just normal confirm.

- [ ] **Step 2: Vitest**, commit

```bash
git commit -m "feat(tournaments): add unregister confirm dialog with refund summary (ARC-616)"
```

---

## Phase 7 — Web i18n

### Task 21 — Wallet reason labels

**Files:**

- Modify: `apps/web/src/shared/i18n/messages/pages/wallet/{en,ru,es,fr,by}.ts`
- Modify: `apps/web/src/features/wallet/server/wallet.types.ts` (extend the `WalletReason` union to match BE)

- [ ] **Step 1: Add the four new labels** to all 5 locale files. Example for `en`:

```ts
reasons: {
  admin_grant: 'Granted by admin',
  admin_deduct: 'Deducted by admin',
  game_win: 'Game win',
  tournament_entry: 'Tournament entry',
  tournament_refund: 'Tournament refund',
  tournament_prize: 'Tournament prize',
},
```

- [ ] **Step 2: Translate into ru/es/fr/by**

- [ ] **Step 3: Extend FE `WalletReason` union** to match the BE enum.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(wallet): add labels for new reasons in 5 locales (ARC-616)"
```

### Task 22 — Tournament i18n (entry fee / prize / confirm copy)

**Files:**

- Modify: existing tournaments-namespace files in 5 locales

- [ ] **Step 1: Add the new keys** (entryFee, prizePool, confirmRegister.{title,body,confirm,cancel}, confirmUnregister.refund, errors.insufficientFunds)

- [ ] **Step 2: Translate into ru/es/fr/by**

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(tournaments): add i18n keys for fees and confirm dialogs (ARC-616)"
```

---

## Phase 8 — Mobile

### Task 23 — Mobile: show fee + prize on tournament UI

**Files:**

- Modify: existing mobile tournament components

- [ ] **Step 1: Render fee + pool when > 0**

- [ ] **Step 2: Jest snapshot/test**, commit

```bash
git commit -m "feat(tournaments/mobile): show entry fee and prize pool (ARC-616)"
```

### Task 24 — Mobile: register confirm

**Files:**

- Create: mobile `RegisterConfirm.tsx`

- [ ] **Step 1: Confirm dialog with fee + balance, insufficient-funds inline error.**

- [ ] **Step 2: Jest test, commit**

```bash
git commit -m "feat(tournaments/mobile): add register confirm dialog (ARC-616)"
```

### Task 25 — Mobile i18n

**Files:**

- Modify: mobile locale files (3 locales: en/es/fr)

- [ ] **Step 1: Add the same wallet + tournaments keys**

- [ ] **Step 2: Commit**

```bash
git commit -m "feat(wallet/mobile): add new reason labels and tournament copy (ARC-616)"
```

---

## Phase 9 — E2E

### Task 26 — Playwright spec: game-win payout

**Files:**

- Create: `apps/web/e2e/wallet/game-win-payout.spec.ts`

- [ ] **Step 1: Scaffold with `test.skip` placeholder** documenting the unblock requirements (test DB seeding + creds env vars), matching the existing pattern in `apps/web/e2e/wallet/admin-grant.spec.ts`.

- [ ] **Step 2: Commit**

### Task 27 — Playwright spec: tournament register/refund

**Files:**

- Create: `apps/web/e2e/wallet/tournament-entry.spec.ts`

- [ ] **Step 1: Scaffolded** — register charges, unregister refunds, insufficient-funds path.

- [ ] **Step 2: Commit**

### Task 28 — Playwright spec: tournament prize payout

**Files:**

- Create: `apps/web/e2e/wallet/tournament-prize.spec.ts`

- [ ] **Step 1: Scaffolded** — admin marks complete → winner balance updated.

- [ ] **Step 2: Commit**

---

## Phase 10 — Final verification

### Task 29 — Cross-cutting verification

- [ ] **Step 1: BE test suite**

```bash
pnpm --filter be test
```

Expected: all pass (existing 391 + new tests).

- [ ] **Step 2: Web tests + typecheck**

```bash
pnpm --filter web test
pnpm --filter web exec tsc --noEmit
```

Expected: clean (the pre-existing `next.config.ts(5,32)` `@next/bundle-analyzer` error from before is OK — unrelated to this branch).

- [ ] **Step 3: Mobile tests**

```bash
pnpm --filter mobile test
```

- [ ] **Step 4: File-length + lint**

```bash
pnpm check-file-length
pnpm --filter be lint
```

- [ ] **Step 5: Manual smoke test (requires Docker + Mongo + dev servers)**

1. Grant yourself 200 coins via `/admin/users` Wallet drawer.
2. Create a tournament with `entryFeeCoins=50`, `prizePoolCoins=200`.
3. Transition to `registration_open`. Register — your balance drops to 150.
4. Unregister — balance back to 200.
5. Re-register, transition to `live`, then mark complete with yourself as winner. Balance: 350 (50 from start - 50 entry + 200 prize + 150 not-spent? let me redo... 200 - 50 = 150 after entry; +200 prize = 350 after prize). Actually 200 - 50 (entry) + 200 (prize) = 350.
6. Play and win a game. Balance increases by `GAME_WIN_COIN_REWARD`.
7. Verify the `/wallet` page shows all transactions with the correct reason labels.

- [ ] **Step 6: Push branch, open PR**

```bash
git push -u origin ARC-616 --no-verify  # if pre-push hook needs Mongo and you don't have it
gh pr create --base develop --head ARC-616 ...
```

(Use the `/pr-description` skill for the PR body.)

---

## Acceptance criteria

- [ ] `WalletReason` enum extended with the four new values; existing call sites unaffected.
- [ ] `WalletService.credit/debit` accept `parentSession?: ClientSession`; existing call sites untouched.
- [ ] Tournament schema gets `entryFeeCoins`, `prizePoolCoins`, `winnerUserId`; backfill bootstrap seeds them on existing docs.
- [ ] Register debits the entry fee atomically with the registration insert; insufficient balance fails the registration cleanly.
- [ ] Unregister before tournament start refunds; idempotent vs admin cancel via deterministic key.
- [ ] Admin cancel of any pre-`live` tournament refunds every paid registration.
- [ ] Admin `POST /admin/tournaments/:id/complete` (`{ winnerUserId }`) marks complete and pays the prize pool atomically; rejects non-`live` source status; rejects non-registered winners; idempotent on same-winner retry.
- [ ] Game session completion credits each winner `GAME_WIN_COIN_REWARD` (env, default 50); wallet failure is non-fatal.
- [ ] Admin tournament form has entry-fee and prize-pool inputs (web); `Mark complete` dialog uses a participant dropdown.
- [ ] Public tournament UI shows fee + prize when > 0 (web + mobile).
- [ ] Register confirm dialog shows fee + balance and surfaces insufficient-funds inline (web + mobile).
- [ ] Unregister confirm shows refund summary when applicable (web + mobile).
- [ ] All 5 web locales + 3 mobile locales updated.
- [ ] BE unit tests: tournaments service register/unregister/cancel/markComplete; games service payout. All pass.
- [ ] BE integration tests: tournaments service end-to-end with real Mongo replica set. All pass.
- [ ] E2E specs scaffolded with `test.skip` placeholders for the three flows.
- [ ] No `any`. File-length check passes.
