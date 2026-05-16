# ARC-616 — Wallet Earn & Spend Loop

**Status:** approved design, ready for implementation planning
**Ticket:** ARC-616
**Date:** 2026-05-10
**Depends on:** ARC-615 (wallet foundation, merged)

## Summary

Activate the dormant currency from ARC-615 by wiring the first earn source (game-win payout) and the first spend sink (tournament entry fee + prize pool) into the existing `games` and `tournaments` modules. After this ticket, players can earn coins by winning games and spend them to enter tournaments, and tournament winners receive coin prizes.

This is the smallest end-to-end loop that proves the economy works. ARC-617 (real-money gem top-up + conversion) and ARC-618+ (cosmetics, daily login, additional spend sinks) build on top.

## Goals

1. Mint coins on game-win so a casual player who plays games sees their balance grow.
2. Burn coins on tournament entry so coins have a purpose.
3. Pay out a tournament prize pool so the loop closes (mint → spend → mint via competition).
4. Use deterministic idempotency keys so completion handlers can be retried/replayed safely.
5. Keep the wallet failure paths cleanly bounded — wallet hiccups must never make a game look stuck or a registration look approved-when-it-isn't.

## Non-goals

- No loss penalty / debit on game loss.
- No multi-place prizes (1st-place / 2nd-place / 3rd-place split). Winner-take-all only.
- No game-win cap per day or anti-farming throttle.
- No real-money gem entry (ARC-617).
- No per-game-type reward tuning. One env-configurable constant for game wins.
- No mobile admin tooling — admin actions remain web-only.
- No new earn sources (daily login, referrals, etc.) — those are ARC-618+.

## Key decisions

### D1 — Earn source: game-win, fixed reward

**Decision:** Each winner of a completed `GameSession` receives `GAME_WIN_COIN_REWARD` (env var, default `50`).

**Why fixed:** Variable rewards (per-game-type, per-duration, per-skill) are an economy-tuning problem; getting it wrong costs more than starting flat and tuning later. Env-var control means rebalance is a config change, not a deploy.

**Why on session completion (not on action):** The existing hook at [games.service.ts:143](apps/be/src/games/games.service.ts#L143) already fires when a session transitions to `completed`. Reusing it means no new lifecycle plumbing; the engine already knows who won via `getWinners(sessionId)`.

### D2 — Spend sink: tournament entry fee, deducted on register

**Decision:** Tournaments gain an `entryFeeCoins` field (admin-set, default 0). When a player registers and the fee > 0, `WalletService.debit` is called inside the same Mongo transaction as the registration insert. Insufficient balance → registration fails atomically and the player gets a 422.

**Why on register (not on tournament start):** Easier to charge once at the moment of intent. Charging at start would require either holding registrations until then (UX delay) or charging-on-start with refund-on-cancel which is more state.

**Why fee = 0 default:** Existing tournaments and the admin-tournaments UI default to free entry; new field doesn't break anything.

### D3 — Refund on unregister before start

**Decision:** Unregistering before the tournament leaves the `upcoming` status refunds the entry fee. After start: no refund.

**Why:** Aligns with normal event-cancellation expectations. Trying to refund mid-event creates loophole / griefing surface (register, watch the bracket, drop out if you'd lose).

### D4 — Tournament prize pool, winner-take-all

**Decision:** Tournaments gain a `prizePoolCoins` field (admin-set, default 0). When a tournament is marked complete with a winner, that winner receives the full pool.

**Why winner-take-all:** Simpler. Multi-place splits add a bracket data model. Can ship later if demand exists.

**Why admin-marks-complete:** Tournament completion already requires admin judgment in this codebase. Adding wallet payout to the existing admin transition keeps the surface to one place; no new automation.

### D5 — Tournament completion is admin-driven

**Decision:** Add `POST /admin/tournaments/:id/complete` taking `{ winnerUserId }`. Sets `status: 'completed'`, `winnerUserId`, and pays the prize in a single transaction.

**Why an explicit endpoint:** The existing tournament transitions don't have a "complete with winner" step. Patching `update-tournament.dto.ts` to accept a winner ID would muddy normal updates. A dedicated endpoint is cleaner and more audit-friendly.

**Status transition path:** Tournaments today move `upcoming → active → completed`. `markComplete` requires `status === 'active'`. Promoting `upcoming` directly to `completed` is rejected — admins must run the existing transition to `active` first. This keeps the prize payout tied to a tournament that actually ran.

**Admin UI:** the winner selector renders a **dropdown populated from the tournament's `registrations[]`**, not a free-text userId field. Free-text is a typo footgun for a payout flow.

### D6 — Idempotency keys are deterministic

**Decision:** All wallet calls in this ticket use deterministic idempotency keys derived from the source entity:

- Game-win: `game-${sessionId}-payout-${userId}`
- Tournament entry: `tournament-${tournamentId}-entry-${userId}`
- Tournament refund: `tournament-${tournamentId}-refund-${userId}`
- Tournament prize: `tournament-${tournamentId}-prize-${userId}`

**Why:** ARC-615 made `idempotencyKey` mandatory. Deterministic keys mean a retried completion handler (e.g. socket reconnect that re-fires the same event) never double-pays — `WalletService` returns the prior transaction.

### D7 — Game-win wallet failure does not fail the game

**Decision:** A wallet credit failure on game completion is logged and swallowed. The session still completes normally.

**Why:** Players have already played the game. A wallet hiccup that surfaces as "your game is stuck" is a worse UX than "your game finished but the reward will arrive shortly" (since the deterministic key means the next payout attempt — manual or via a future reconciliation job — will fill the gap).

### D8 — Tournament-entry wallet failure DOES fail the registration

**Decision:** A wallet debit failure on register surfaces a 422 to the client and aborts the registration write.

**Why:** Players need to know whether they got in. A "you're registered but we didn't charge you" state is worse than "registration failed, please try again" — the former erodes trust in the ticketing.

### D9 — Configuration

**Decision:**

- `GAME_WIN_COIN_REWARD` — env var read once at module init via `ConfigService`. Default 50.
- `entryFeeCoins` and `prizePoolCoins` — per-tournament fields, set by admin via the existing tournament create/update UIs. Default 0.

**Why split:** The game-win reward applies globally and is an operations lever. The tournament fields apply per-event and are an admin lever.

## Data model changes

### Tournament schema

[apps/be/src/tournaments/schemas/tournament.schema.ts](apps/be/src/tournaments/schemas/tournament.schema.ts):

```ts
@Prop({ type: Number, default: 0, min: 0, max: 1_000_000 })
entryFeeCoins!: number;

@Prop({ type: Number, default: 0, min: 0, max: 1_000_000 })
prizePoolCoins!: number;

@Prop({ type: String, default: null })
winnerUserId!: string | null;
```

A one-time backfill `updateMany({ entryFeeCoins: { $exists: false } }, ...)` runs on application bootstrap to set the default zeros on existing tournament docs (mirrors the wallet bootstrap pattern from ARC-615).

### WalletReason enum

[apps/be/src/wallet/interfaces/wallet-types.ts](apps/be/src/wallet/interfaces/wallet-types.ts):

```ts
export const WALLET_REASONS = [
  'admin_grant',
  'admin_deduct',
  'game_win',
  'tournament_entry',
  'tournament_refund',
  'tournament_prize',
] as const;
```

The TS union update will be picked up by all consumers via type-checking; old ledger rows remain valid (string enum).

## Backend integration

### Module wiring

```
GamesModule.imports += [WalletModule]
TournamentsModule.imports += [WalletModule]
```

`WalletModule` already exports `WalletService` (ARC-615); no `WalletModule` changes needed.

### GamesService — game-win payout

At [games.service.ts:143](apps/be/src/games/games.service.ts#L143) (the `updatedSession.status === 'completed'` branch):

```ts
if (updatedSession.status === 'completed') {
  // ... existing leaderboard sync ...
  await this.payoutGameWin(updatedSession);
}

private async payoutGameWin(session: GameSessionDocument): Promise<void> {
  try {
    const winners = await this.gameSessions.getWinners(String(session._id));
    if (winners.length === 0) return;

    for (const winnerId of winners) {
      try {
        await this.wallet.credit(
          winnerId,
          'coins',
          this.gameWinCoinReward,
          'game_win',
          `game-${session._id}-payout-${winnerId}`,
          { sessionId: String(session._id), gameId: session.gameId },
        );
      } catch (err) {
        // Don't fail the session-complete path on a wallet hiccup.
        this.logger.warn(
          `Game-win payout failed for session ${session._id} winner ${winnerId}: ${(err as Error).message}`,
        );
      }
    }
  } catch (err) {
    // getWinners failure — also non-fatal for the session.
    this.logger.warn(
      `Failed to determine winners for session ${session._id}: ${(err as Error).message}`,
    );
  }
}
```

`gameWinCoinReward` is initialised in the service constructor:

```ts
this.gameWinCoinReward = Number(this.config.get('GAME_WIN_COIN_REWARD', '50'));
```

### TournamentsService — register / unregister

`register(id, userId)` becomes transactional (Mongoose session) when `entryFeeCoins > 0`:

```ts
async register(id, userId) {
  const tournament = await this.tournamentModel.findById(id).lean();
  if (!tournament) throw new NotFoundException(...);
  // ... existing validations: status === 'upcoming', not already registered, capacity ...

  if (tournament.entryFeeCoins > 0) {
    // The wallet debit lives inside the same Mongo session as the registration
    // insert below, so a failure on either side aborts both.
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        await this.wallet.debit(
          userId,
          'coins',
          tournament.entryFeeCoins,
          'tournament_entry',
          `tournament-${id}-entry-${userId}`,
          { tournamentId: id },
          // The wallet's own session-aware path; see "Cross-session-coordination"
          // below for the mechanism.
        );
        await this.tournamentModel.updateOne(
          { _id: id },
          { $push: { registrations: { userId, registeredAt: new Date(), waitlist: ... } } },
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
    return;
  }

  // Free tournaments — no transaction needed.
  await this.tournamentModel.updateOne(...);
}
```

**Cross-session coordination (subtle):** `WalletService.debit` already wraps its work in its own Mongo transaction (ARC-615). To avoid nested-transaction issues, `WalletService.debit` accepts an optional `parentSession?: ClientSession` parameter — when present, the wallet uses that session instead of opening its own. This is a small extension to the wallet service signature, not a redesign.

**Backward compatibility:** `parentSession` is optional and trailing on the signature. All existing ARC-615 call sites (admin grant/deduct controllers, future internal callers) remain unchanged — they continue to use the wallet's own session. The unit and integration tests from ARC-615 must continue to pass byte-for-byte after this extension.

`unregister(id, userId)`:

```ts
async unregister(id, userId) {
  const tournament = await this.tournamentModel.findById(id).lean();
  // ... existing validations, find registration row ...
  const wasRegistered = !!registration;
  const status = tournament.status;

  // Refund only if registered with a paid entry, before tournament start.
  const shouldRefund =
    wasRegistered && tournament.entryFeeCoins > 0 && status === 'upcoming';

  if (shouldRefund) {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        await this.wallet.credit(
          userId,
          'coins',
          tournament.entryFeeCoins,
          'tournament_refund',
          `tournament-${id}-refund-${userId}`,
          { tournamentId: id },
          // pass session
        );
        await this.tournamentModel.updateOne(
          { _id: id },
          { $pull: { registrations: { userId } } },
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
    return;
  }

  // Free tournament or after-start unregister — just remove the row.
  await this.tournamentModel.updateOne(...);
}
```

### TournamentsService — admin cancel (refund all)

If an admin cancels an `upcoming` tournament, every paid registration is refunded. The existing tournament-cancellation transition (or a new admin endpoint if one doesn't exist — implementer to confirm during planning) iterates `registrations[]` and calls `WalletService.credit(...)` with `reason: 'tournament_refund'` and the same deterministic key as a self-unregister (`tournament-${id}-refund-${userId}`) — so a player who already unregistered can't be double-refunded by the admin pass.

```ts
async cancelUpcoming(id): Promise<void> {
  const tournament = await this.tournamentModel.findById(id).lean();
  if (!tournament || tournament.status !== 'upcoming') {
    throw new BadRequestException('tournaments.cannotCancel');
  }
  const session = await this.connection.startSession();
  try {
    await session.withTransaction(async () => {
      await this.tournamentModel.updateOne(
        { _id: id },
        { $set: { status: 'cancelled' } },
        { session },
      );
      if (tournament.entryFeeCoins > 0) {
        for (const reg of tournament.registrations) {
          await this.wallet.credit(
            reg.userId,
            'coins',
            tournament.entryFeeCoins,
            'tournament_refund',
            `tournament-${id}-refund-${reg.userId}`,
            { tournamentId: id, reason: 'admin_cancel' },
            // pass session
          );
        }
      }
    });
  } finally {
    await session.endSession();
  }
}
```

(If a `cancelled` status doesn't already exist, add it to the tournament status union as part of the schema work.)

### TournamentsService — markComplete

New method, called from a new admin endpoint:

```ts
async markComplete(id, winnerUserId): Promise<TournamentDetail> {
  const tournament = await this.tournamentModel.findById(id).lean();
  if (!tournament) throw new NotFoundException(...);
  if (tournament.status === 'completed') {
    // Idempotent: if already complete with the same winner, no-op.
    if (tournament.winnerUserId === winnerUserId) return ...;
    throw new BadRequestException('tournaments.alreadyCompleted');
  }
  if (tournament.status !== 'active') {
    throw new BadRequestException('tournaments.notActive');
  }
  const isRegistered = tournament.registrations.some(
    (r) => r.userId === winnerUserId,
  );
  if (!isRegistered) {
    throw new BadRequestException('tournaments.winnerNotRegistered');
  }

  const session = await this.connection.startSession();
  try {
    await session.withTransaction(async () => {
      // Mark complete + record winner.
      await this.tournamentModel.updateOne(
        { _id: id, status: 'active' },
        { $set: { status: 'completed', winnerUserId } },
        { session },
      );

      // Pay the prize, if any.
      if (tournament.prizePoolCoins > 0) {
        await this.wallet.credit(
          winnerUserId,
          'coins',
          tournament.prizePoolCoins,
          'tournament_prize',
          `tournament-${id}-prize-${winnerUserId}`,
          { tournamentId: id },
          // pass session
        );
      }
    });
  } finally {
    await session.endSession();
  }

  return this.getDetail(id);
}
```

### WalletService — `parentSession` extension

[apps/be/src/wallet/wallet.service.ts](apps/be/src/wallet/wallet.service.ts) — `credit` and `debit` get an optional `parentSession?: ClientSession`:

```ts
async credit(
  userId, currency, amount, reason, idempotencyKey, metadata?,
  parentSession?: ClientSession,
): Promise<WalletTransactionView> {
  // ... existing validation ...

  if (parentSession) {
    // Use caller's session — the caller owns commit/abort.
    return this.executeWalletWrite(
      parentSession, userId, currency, +amount, reason, idempotencyKey, metadata,
      /* isDebit */ false,
    );
  }

  // Existing path: open our own session + transaction.
  const session = await this.connection.startSession();
  try {
    let result!: WalletTransactionView;
    await session.withTransaction(async () => {
      result = await this.executeWalletWrite(...);
    });
    return result;
  } finally {
    await session.endSession();
  }
}
```

The existing transaction logic is extracted into a private `executeWalletWrite(session, ...)` helper. Behaviour without `parentSession` is bit-identical to ARC-615.

### REST API additions

**Admin tournaments controller** ([apps/be/src/tournaments/admin-tournaments.controller.ts](apps/be/src/tournaments/admin-tournaments.controller.ts)):

| Method | Route                             | Body                       | Returns            |
| ------ | --------------------------------- | -------------------------- | ------------------ |
| `POST` | `/admin/tournaments/:id/complete` | `{ winnerUserId: string }` | `TournamentDetail` |

Guarded by `JwtAuthGuard` + `RolesGuard` with `@Roles('admin')`.

**Tournament create/update DTOs:**

```ts
@IsInt() @Min(0) @Max(1_000_000) @IsOptional()
entryFeeCoins?: number;

@IsInt() @Min(0) @Max(1_000_000) @IsOptional()
prizePoolCoins?: number;
```

The `register()` and `unregister()` HTTP endpoints don't change shape; the wallet behaviour is internal.

### Backfill bootstrap

[apps/be/src/tournaments/lib/tournaments-bootstrap.ts](apps/be/src/tournaments/lib/tournaments-bootstrap.ts) (new), mirrors the ARC-615 wallet-bootstrap pattern:

```ts
@Injectable()
export class TournamentsBootstrap implements OnApplicationBootstrap {
  // ...
  async onApplicationBootstrap(): Promise<void> {
    await Promise.all([
      this.tournamentModel.updateMany(
        { entryFeeCoins: { $exists: false } },
        { $set: { entryFeeCoins: 0 } },
      ),
      this.tournamentModel.updateMany(
        { prizePoolCoins: { $exists: false } },
        { $set: { prizePoolCoins: 0 } },
      ),
      this.tournamentModel.updateMany(
        { winnerUserId: { $exists: false } },
        { $set: { winnerUserId: null } },
      ),
    ]);
  }
}
```

## Web UI

### Admin tournament form

[apps/web/src/features/admin-tournaments/](apps/web/src/features/admin-tournaments/):

- Add "Entry fee (coins)" and "Prize pool (coins)" number inputs to the create/edit form. Both default 0.
- Add a "Mark complete" action on the tournament detail / row. Opens a dialog asking for the winner's userId (or, ideally, a select dropdown populated from the registered participants — implementer can pick whichever is faster given the existing form patterns).

### Public tournament list / detail

- Display entry fee + prize pool prominently when > 0 (e.g. "Entry: 50 coins · Prize: 500 coins").
- Existing `prizeDescription` free-text continues to render below for prose.

### Registration confirm flow

- When the player clicks Register on a tournament with `entryFeeCoins > 0`, open a confirm dialog showing fee + their current balance. Submit posts to the existing register endpoint.
- On 422 `wallet.insufficientFunds`, render an inline error in the dialog with a helpful message and a link to `/wallet`.

### Unregister confirm flow

- When the player clicks Unregister and the tournament is `upcoming` and `entryFeeCoins > 0`, show "You'll be refunded N coins."
- After tournament start, no refund text — just a normal confirm.

### `/wallet` page

Already exists. Just needs i18n labels for the new `WalletReason` values. The existing rendering in `TransactionRow` and `WalletPageView` is reason-agnostic.

## Mobile UI

- Tournament list / detail: show entry fee + prize pool when > 0.
- Registration confirm: same flow as web, native dialog. Insufficient-funds inline error.
- No mobile admin surface (matches ARC-615).
- Wallet screen: i18n picks up new reason labels automatically.

## i18n

**Web (5 locales: en, ru, es, fr, by)** — extend two namespaces:

`pages/wallet/{locale}.ts`:

```ts
reasons: {
  // existing
  admin_grant: 'Granted by admin',
  admin_deduct: 'Deducted by admin',
  // new
  game_win: 'Game win',
  tournament_entry: 'Tournament entry',
  tournament_refund: 'Tournament refund',
  tournament_prize: 'Tournament prize',
},
```

`pages/tournaments/{locale}.ts` (or wherever tournament copy lives):

```ts
entryFee: 'Entry fee',
prizePool: 'Prize pool',
confirmRegister: {
  title: 'Confirm entry',
  body: 'This tournament costs {{fee}} coins. Your balance: {{balance}} coins.',
  confirm: 'Pay & Register',
  cancel: 'Cancel',
},
confirmUnregister: {
  refund: "You'll be refunded {{amount}} coins.",
},
errors: {
  insufficientFunds: 'Not enough coins to enter.',
},
```

**Mobile (3 locales: en, es, fr)** — same keys via mobile i18n.

## Validation, errors, security

- `entryFeeCoins` and `prizePoolCoins` validated at DTO layer (positive int, max 1_000_000).
- `register()` only debits when fee > 0 (no zero-amount calls; the wallet rejects them).
- Insufficient-balance throws `InsufficientFundsException` (HTTP 422) — same path ARC-615 already established.
- `markComplete` requires admin role and validates winner is among registered participants.
- All wallet writes use deterministic idempotency keys; replays are no-ops.
- A failed game-win payout is logged but doesn't crash the session-complete handler.
- A failed registration debit aborts the entire register transaction (Mongo transaction rollback).

## Tests

### Unit

**`tournaments.service.spec.ts`** (extended):

- `register` with `entryFeeCoins > 0` debits the wallet then writes the registration.
- `register` rejects with `InsufficientFundsException` when wallet throws; no registration row is written.
- `register` with `entryFeeCoins === 0` skips the wallet entirely (verifies no debit call).
- `unregister` before start refunds.
- `unregister` after start does not refund.
- `unregister` of someone never registered: no refund, normal noop / error.
- `markComplete` happy path: pays prize, records winner, status → completed.
- `markComplete` on already-completed tournament with same winner: idempotent noop.
- `markComplete` on already-completed with different winner: rejects.
- `markComplete` with non-registered winner: rejects.
- `markComplete` with `prizePoolCoins === 0`: marks complete, no wallet credit call.

**`games.service.spec.ts`** (extended):

- Session transitions to `completed` with one winner: `wallet.credit` called once with the correct args.
- Session transitions to `completed` with multiple winners: `wallet.credit` called once per winner.
- `wallet.credit` throws: session still finalises, error logged.
- `getWinners` throws: session still finalises, error logged.

**`wallet.service.spec.ts`** (extended):

- `credit` with `parentSession` skips its own transaction wrapper and uses the caller's session.
- `debit` with `parentSession` likewise.

### Integration (real Mongo replica set)

`tournaments.service.integration-spec.ts` (new):

- End-to-end register → wallet debit → registration row inserted → wallet ledger row inserted, all in one transaction.
- Concurrent `register` from the same user with insufficient combined balance: only one succeeds.
- `unregister` refunds, balance restored, ledger has the refund row.
- `markComplete` pays prize and is idempotent on a retry.

`games.service.integration-spec.ts` (extended): a session marked complete with a winner credits the wallet end-to-end.

### Web Vitest

- Server actions / data hooks for the confirm dialogs.
- Form validation for the new admin form fields.
- i18n key presence test (existing pattern).

### Mobile Jest

- Confirm-register dialog renders fee + balance and surfaces 422 inline.

### E2E (Playwright)

Three new specs scaffolded with `test.skip` matching the existing pattern:

- Game-win payout updates wallet balance.
- Tournament register/unregister flow with refund.
- Admin marks complete → winner's balance updated.

## Cross-cutting compliance

- File size: every new/modified file stays well under 500 lines.
- TypeScript: no `any`. Strict typing throughout.
- Next.js: Server Components for any new server-rendered surfaces; client islands only where required by interactions (the confirm dialogs).
- i18n: zero hardcoded user-facing strings; all 5 web + 3 mobile locales updated.
- BE: all DTOs validated; all admin routes guarded with `JwtAuthGuard + RolesGuard + @Roles('admin')`.
- Tests: unit + integration + scaffolded e2e.
- Wallet writes: only via `WalletService.credit/debit`; the ESLint guardrail from ARC-615 still enforces this.

## Edge cases & open items

| Topic                                                          | Decision                                                                                     | Notes                                                    |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Existing tournaments without the new fields                    | Backfilled to `0` / `null` on bootstrap.                                                     | Mongoose defaults handle reads regardless.               |
| User deletion mid-tournament                                   | Out of scope (same as ARC-615).                                                              | Surface in plan if user-deletion flow lands later.       |
| Tournament cancellation (admin cancels an upcoming tournament) | Refund all registered users.                                                                 | Captured in plan; mirrors unregister-before-start logic. |
| Multi-place prize splits                                       | Out of scope.                                                                                | ARC-618+.                                                |
| Game-loss penalty                                              | Out of scope.                                                                                | Future ticket if economy needs additional sinks.         |
| Per-game-type rewards                                          | Out of scope.                                                                                | Single env var for now.                                  |
| Transaction failure on prize payout                            | The `markComplete` Mongo transaction rolls back; tournament stays `active`, admin can retry. | Same idempotency key on retry.                           |
