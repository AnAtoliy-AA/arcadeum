# ARC-615 — Wallet Foundation (Ingame Currency, Phase 1)

**Status:** approved design, ready for implementation planning
**Ticket:** ARC-615
**Date:** 2026-05-09
**Author:** brainstorming session

## Summary

Introduce a dual-currency wallet (`coins` soft, `gems` hard) into the Arcadeum platform as the foundation for an in-game economy. ARC-615 ships only the substrate: schema, ledger, service, admin tooling, player-facing read-only surfaces, and live updates. There are **no automated earn sources, no automated spend sinks, and no real-money top-up in this ticket** — those live in subsequent tickets that build on this foundation.

## Roadmap context

ARC-615 is the first of a planned multi-ticket rollout:

| Ticket                  | Scope                                                                                                                   | Depends on |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------- |
| **ARC-615 (this spec)** | Wallet foundation: schema, ledger, service, admin grant/deduct, player balance + history UI, live updates.              | nothing    |
| **ARC-616**             | First earn source + first spend sink (e.g. game-win payout, tournament entry fee).                                      | 615        |
| **ARC-617**             | Real-money gem top-up via PayPal + gem→coin conversion.                                                                 | 615        |
| **ARC-618+**            | Additional earn sources (daily login, referrals, leaderboards) and spend sinks (cosmetics, boosts) as discrete tickets. | 615        |

ARC-615 is shippable on its own: a dormant currency system that admins can hand-test by granting balances. It is not yet _useful to players_ — that is by design and is the point of decomposing the rollout.

## Goals

1. Establish the canonical place where wallet state lives and is mutated.
2. Provide a small, hard-to-misuse service API (`credit` / `debit` / `getBalance` / `getHistory`) that all later economy work consumes.
3. Make admin grant/deduct possible end-to-end so QA, support, and ops can operate the system from day one.
4. Surface the player's balance and transaction history in a way that real-time updates work the moment ARC-616 ships.
5. Establish correctness primitives (idempotency, atomic balance + ledger writes, append-only ledger) so future economy work cannot accidentally drift.

## Non-goals

- No real-money payments / gem top-ups (ARC-617).
- No automatic earn sources tied to gameplay, tournaments, referrals, or leaderboards (ARC-616+).
- No automatic spend sinks (ARC-616+).
- No gem→coin conversion (ARC-617).
- No fractional balances. Whole integers only.
- No mobile admin tooling. Admin actions are web-only, matching the rest of the admin shell.
- No separate `/admin/wallets` aggregate view in this ticket. Wallet admin lives inline on the existing admin-users page.

## Key decisions

The full decision rationale is captured here so future readers do not have to re-derive it from the implementation.

### D1 — Dual currency model

**Decision:** two balances per user — `coins` (soft, earned through play, never bought) and `gems` (hard, purchased with real money in ARC-617). Gems will convert to coins at a fixed rate in ARC-617; coins never convert back to gems.

**Why not a single balance:** a single fillable-via-money balance creates pay-to-win pressure and blurs earn/spend economy design. A two-currency model is the standard mobile-game pattern and keeps the economy levers separable.

### D2 — Storage architecture

**Decision:** denormalized `coins` and `gems` fields on `User` plus a separate append-only `WalletTransaction` ledger collection. Reads come from `User`. Writes update `User` and insert a ledger row inside a single Mongo transaction.

**Why not a separate `Wallet` collection:** clean separation but no tangible benefit at this stage. Adds a read hop and a join. Easy to evolve to later if wallet grows lifecycle fields.

**Why not ledger-only with computed balance:** strongest correctness story, but every balance read pays an aggregation cost. Migrating _to_ a cached balance later is easy; migrating _away_ is harder.

The denormalized balance is a cache. The ledger is the source of truth and can rebuild the balance if drift is ever detected (a reconciliation job, out of scope for 615, can verify `sum(delta) per (userId, currency) == User.[currency]`).

### D3 — Number representation

**Decision:** whole integers only. `coins` and `gems` are `Number` (Mongoose) constrained to non-negative integers. `delta` on the ledger is a signed integer.

**Why not Decimal128 or scaled integers:** no use case for fractions in player-facing currency. Decimal128 carries a TS ergonomics tax (no native arithmetic). If a future calculation produces fractions (e.g. revenue share), it will round to integer at the wallet boundary.

### D4 — Insufficient-balance behavior

**Decision:** debits below zero are rejected. `WalletService.debit(...)` throws `InsufficientFundsException`.

**Why:** allowing negative balances is a customer-support and UI nightmare. The wallet is player-facing.

### D5 — Idempotency

**Decision:** every wallet mutation requires an `idempotencyKey`. Duplicate keys return the existing transaction (no double-write).

**Why:** retrofitting idempotency to a system that already has wallet writes in the wild is dramatically more painful than building it in. Internal callers pass deterministic keys (e.g. `tournament-${id}-payout-${userId}`); admin actions generate `randomUUID()` server-side. The unique index on `idempotencyKey` enforces it at the storage layer.

### D6 — Admin tools surface

**Decision:** wallet admin lives inline on the existing admin-users page as a row action that opens a drawer. No new top-level `/admin/wallets` page in 615.

**Why:** the per-user "grant N coins for an event/compensation" workflow is the common admin task at this stage. An aggregate page is mostly useful once an economy is in motion (top balances, total in circulation, suspicious activity) — none of which exists in the foundation ticket.

### D7 — Player-facing UI

**Decision:**

- Balance chip in the header on web and mobile (always visible).
- Dedicated `/wallet` page (web) and `profile/wallet` screen (mobile) for paginated transaction history.

**Why:** the chip is table-stakes — players need to see "what do I have right now" without navigation. The history page is cheap to ship in 615 and prevents support load (players must be able to answer "where did my coins go?" once anything ever changes their balance).

### D8 — Real-time updates

**Decision:** BE emits `wallet:updated` over the existing shared socket on every successful mutation. FE listens once near the top of the authed tree and invalidates the relevant cache (web: `router.refresh()`; mobile: TanStack Query invalidation).

**Why:** the second ARC-616 ships a "win a game → +50 coins" payout, players will expect the chip to pop up the new value immediately. Wiring sockets in 615 is cheap and removes a dependency from 616.

### D9 — Web data layer: Server Components + Server Actions

**Decision:** the wallet feature on web uses Server Components for data fetching and Server Actions for mutations. **TanStack Query is not used for wallet on web.**

**Why:** explicit user direction. CLAUDE.md says "Web: use TanStack Query" as the project default; this feature intentionally diverges. Scope of the divergence is the wallet feature only — the rest of the web app is unaffected, and mobile (which has no Server Actions equivalent) keeps TanStack Query.

**Implications:**

- Pagination is cursor-in-URL (`?cursor=...`) with a "Next" link. Fully server-rendered, deep-linkable, plays cleanly with `router.refresh()`.
- Live updates from the socket are routed through a small client island that calls `router.refresh()` on `wallet:updated`.
- Admin drawer uses `useTransition` + server actions for grant/deduct.

### D10 — Role gating for admin

**Decision:** `/admin/wallet/*` routes are restricted to `admin` only. `moderator` does not get wallet write access in 615.

**Why:** admin grant/deduct directly affects player-visible state with no automatic audit beyond the ledger we are building. Tightening to a single role at the start lets us widen later when policy is clearer; widening is reversible, narrowing after access is granted is socially harder.

## Architecture

### Backend module layout

```
apps/be/src/wallet/
├── dto/
│   ├── grant-wallet.dto.ts
│   ├── deduct-wallet.dto.ts
│   └── list-transactions.dto.ts
├── interfaces/
│   ├── wallet-balance.interface.ts
│   └── wallet-transaction.interface.ts
├── schemas/
│   └── wallet-transaction.schema.ts
├── exceptions/
│   ├── insufficient-funds.exception.ts
│   └── invalid-currency.exception.ts
├── wallet.service.ts
├── wallet.service.spec.ts
├── wallet.controller.ts                    // player-facing
├── admin-wallet.controller.ts              // admin-only
├── admin-wallet.controller.spec.ts
└── wallet.module.ts
```

The User schema gets two new `@Prop` fields. No other module mutates `coins`/`gems` directly — only `WalletService` does. This is enforced by code review and an ESLint `no-restricted-syntax` rule banning direct property access on `coins`/`gems` outside `apps/be/src/wallet/`.

### Data model

**User** (additions to [apps/be/src/auth/schemas/user.schema.ts](apps/be/src/auth/schemas/user.schema.ts)):

```ts
@Prop({ type: Number, default: 0, min: 0 }) coins!: number;
@Prop({ type: Number, default: 0, min: 0 }) gems!: number;
```

A one-time backfill `updateMany({ coins: { $exists: false } }, { $set: { coins: 0, gems: 0 } })` runs once on deploy so the on-disk representation is consistent.

**WalletTransaction** (new collection):

```ts
{
  _id: ObjectId,
  userId: ObjectId,           // indexed
  currency: 'coins' | 'gems', // discriminator
  delta: number,              // signed integer; +N for credit, -N for debit
  balanceAfter: number,       // post-write snapshot for audit
  reason: WalletReason,       // string enum (see below)
  idempotencyKey: string,     // unique index
  metadata?: Record<string, unknown>, // e.g. { adminUserId, note }
  createdAt: Date,
  updatedAt: Date,
}
```

Indexes:

- `{ userId: 1, createdAt: -1, _id: -1 }` — drives the player history page (resilient to ties).
- `{ userId: 1, currency: 1, createdAt: -1, _id: -1 }` — drives currency-filtered history.
- Unique on `{ idempotencyKey: 1 }`.

**WalletReason enum** (string union, extensible):

```ts
type WalletReason = 'admin_grant' | 'admin_deduct';
// future, not in 615:
// | 'game_win' | 'tournament_entry' | 'tournament_payout'
// | 'gem_purchase' | 'gem_to_coin_conversion' | 'cosmetic_purchase'
```

### WalletService API

```ts
class WalletService {
  credit(
    userId: string,
    currency: WalletCurrency,
    amount: number, // positive integer
    reason: WalletReason,
    idempotencyKey: string,
    metadata?: Record<string, unknown>,
  ): Promise<WalletTransaction>;

  debit(
    userId: string,
    currency: WalletCurrency,
    amount: number, // positive integer
    reason: WalletReason,
    idempotencyKey: string,
    metadata?: Record<string, unknown>,
  ): Promise<WalletTransaction>; // throws InsufficientFundsException

  getBalance(userId: string): Promise<{ coins: number; gems: number }>;

  getHistory(
    userId: string,
    opts: { currency?: WalletCurrency; cursor?: string; limit?: number },
  ): Promise<{ items: WalletTransaction[]; nextCursor: string | null }>;
}
```

**Atomicity** — both `credit` and `debit` run inside a Mongo transaction:

1. Conditional `User.findOneAndUpdate({ _id, [currency]: { $gte: amount }}, { $inc: { [currency]: ±amount }})` — the `$gte` guard makes the debit check atomic, eliminating read-then-write races.
2. `WalletTransaction.create({ ..., balanceAfter: result.[currency] })`.

If step 1 returns `null` on a debit, throw `InsufficientFundsException` (the transaction aborts). If a duplicate `idempotencyKey` collides on step 2, the unique-index error is caught, the prior transaction is fetched and returned, and step 1's mutation is undone (transaction abort) — so a duplicate idempotent call is genuinely a no-op.

**Socket emit** — on every successful mutation, the service emits `wallet:updated` with payload `{ coins, gems }` to the user's socket room only. Never broadcast.

### REST API surface

#### Player-facing — `/wallet`

All routes guarded by `JwtAuthGuard`. User identity comes from the JWT.

| Method | Route                                           | Returns                                                         |
| ------ | ----------------------------------------------- | --------------------------------------------------------------- |
| `GET`  | `/wallet/balance`                               | `{ coins: number; gems: number }`                               |
| `GET`  | `/wallet/transactions?currency=&cursor=&limit=` | `{ items: WalletTransactionDto[]; nextCursor: string \| null }` |

Default `limit` 20, capped at 100. `currency` filter optional.

`WalletTransactionDto` exposes `{ id, currency, delta, balanceAfter, reason, createdAt, metadata }` — never `idempotencyKey` (implementation detail).

#### Admin-facing — `/admin/wallet`

Guarded by `JwtAuthGuard` + `RolesGuard` with `@Roles('admin')`.

| Method | Route                                          | Body                          | Returns                       |
| ------ | ---------------------------------------------- | ----------------------------- | ----------------------------- |
| `GET`  | `/admin/wallet/users/:userId/balance`          | —                             | `{ coins, gems }`             |
| `GET`  | `/admin/wallet/users/:userId/transactions?...` | —                             | Same shape as player history. |
| `POST` | `/admin/wallet/users/:userId/grant`            | `{ currency, amount, note? }` | `WalletTransactionDto`        |
| `POST` | `/admin/wallet/users/:userId/deduct`           | `{ currency, amount, note? }` | `WalletTransactionDto`        |

Admin grant/deduct generate `idempotencyKey = randomUUID()` server-side. Metadata captures `{ adminUserId, note }`. `InsufficientFundsException` returns HTTP 422 with `{ message: 'wallet.insufficientFunds', currency, requested, available }`.

### Web UI

**Surfaces:**

1. **Balance chip in header** — Server Component fetching via `getWalletBalance()` server module. Renders `🪙 1,250 💎 30`. Includes a tiny invisible client island `<WalletLiveBridge />` that subscribes to the socket and calls `router.refresh()` on `wallet:updated`.

2. **`/wallet` page** — Server Component at `apps/web/src/app/[locale]/(authed)/wallet/page.tsx`. Reads `searchParams` (`currency`, `cursor`), server-fetches balance + page of transactions. Filter chips are `<Link>` elements with `?currency=...`. Pagination is cursor-in-URL with a "Next" link. Three-file pattern (`page.tsx` + `WalletPageView.tsx` — no `*Client.tsx` since there's no client data layer for the page).

3. **Admin wallet drawer** — client component opened from a row action on the admin-users page. Calls `loadAdminWalletAction(userId)` once on open to fetch balance + recent transactions in a single round trip. Grant/deduct forms invoke server actions `grantWalletAction()` / `deductWalletAction()` (in `apps/web/src/features/admin-wallet/server/wallet.actions.ts`). Wrapped in `useTransition` for responsiveness. On success: `revalidatePath('/admin/users')`, toast, drawer reloads in-drawer data. On 422: typed error rendered inline.

**Module layout (web):**

```
apps/web/src/features/wallet/
├── server/wallet.server.ts            // getWalletBalance, getWalletTransactions
└── ui/
    ├── BalanceChip.tsx                // Server Component
    ├── WalletLiveBridge.tsx           // tiny client island
    ├── WalletPageView.tsx
    └── TransactionRow.tsx

apps/web/src/features/admin-wallet/
├── server/wallet.actions.ts           // grantWalletAction, deductWalletAction, loadAdminWalletAction
└── ui/
    ├── AdminWalletDrawer.tsx
    └── AdminWalletForm.tsx
```

**i18n:** new `wallet` namespace covering balance labels, page metadata (with SEO regression coverage), filter chips, reason labels (one per `WalletReason`), error messages, admin form labels, empty/loading states. All five locales (en, ru, es, fr, by) updated.

**Component reuse:** `/check-ui-components` runs first against `@arcadeum/ui` for chip/pill, currency icons, drawer/sheet, paginated list, skeleton row. Anything missing is promoted to `packages/ui`.

### Mobile UI

Mobile uses TanStack Query (no Server Actions on RN).

**Surfaces:**

1. **Balance chip** — `apps/mobile/src/features/wallet/ui/BalanceChip.tsx`. Hook `useWalletBalance()` (TanStack Query, key `['wallet', 'balance']`). Mounted in the existing mobile header.

2. **Wallet screen** — Expo Router screen under `(tabs)/profile/wallet.tsx` (nested in profile section — matches the "wallet is part of your account" mental model and doesn't burn a tab slot). Layout mirrors web: balance summary, segmented currency filter, virtualized transaction list. `useInfiniteQuery` for pagination. `RefreshControl` → `refetch()`.

3. **Live updates** — `useWalletSocket()` mounted once in the authed group's root layout. Subscribes to `wallet:updated`, calls `queryClient.invalidateQueries({ queryKey: ['wallet'] })`.

**No admin surface on mobile.** Admin actions remain web-only.

**i18n:** same `wallet` namespace consumed via the mobile i18n setup.

**Component reuse:** `/check-ui-components` runs first; missing components are promoted to `@arcadeum/ui` (cross-platform Tamagui).

## Validation, errors, security

### Validation

DTOs use `class-validator`:

- `currency`: `@IsIn(['coins', 'gems'])`.
- `amount`: `@IsInt() @IsPositive() @Max(1_000_000)` — sanity ceiling on a single transaction.
- `note`: `@IsString() @IsOptional() @MaxLength(500)`.
- `cursor`: `@IsString() @IsOptional()`.
- `limit`: `@IsInt() @Min(1) @Max(100) @IsOptional()`, defaults to 20.

### Errors

| Exception                      | Status | Message key                | Notes                                                                      |
| ------------------------------ | ------ | -------------------------- | -------------------------------------------------------------------------- |
| `InsufficientFundsException`   | 422    | `wallet.insufficientFunds` | Body includes `{ currency, requested, available }`.                        |
| `InvalidCurrencyException`     | 400    | `wallet.invalidCurrency`   | Defensive — DTOs already enforce currency, but the service throws as well. |
| Validation failure             | 400    | (class-validator default)  | DTO violations.                                                            |
| `InternalServerErrorException` | 500    | `wallet.transactionFailed` | After retry of a transient Mongo transaction abort.                        |

Duplicate `idempotencyKey` is **not** an error — service catches the unique-index violation, fetches the prior transaction, and returns it. Caller cannot distinguish from a fresh success (intentional).

### Security

- `JwtAuthGuard` on every player route; user identity from JWT only.
- `JwtAuthGuard` + `RolesGuard` with `@Roles('admin')` on every admin route.
- Wallet schema fields and ledger collection are read-only outside `WalletService`. Enforced by review + lint rule.
- Admin actions log structured events (`adminUserId`, `targetUserId`, `currency`, `amount`, `reason`, `note`, transaction id) via the existing logger.
- Socket emit goes only to the user's own room.

## Testing

### Unit tests

**`wallet.service.spec.ts` (Jest, BE):**

- `credit` happy path — balance increments, ledger row created, `balanceAfter` correct.
- `credit` rejects non-positive amounts, non-integer amounts.
- `credit` rejects unknown currency.
- `credit` idempotent — same `idempotencyKey` twice returns the original transaction; ledger has exactly one row.
- `debit` happy path.
- `debit` throws `InsufficientFundsException` when balance < amount; no ledger row created.
- `debit` race — two concurrent debits totaling more than balance, only one succeeds (verified via `$gte` conditional update).
- `getBalance` returns current values.
- `getHistory` cursor pagination — ordering, currency filter, limit cap.

**`admin-wallet.controller.spec.ts` and `wallet.controller.spec.ts` (Jest, BE):**

- DTO validation rejects bad input.
- Guards reject anonymous and non-admin requests.
- Admin grant/deduct calls service with correct reason and metadata.

**Web (Vitest):**

- `getWalletBalance()` server module — fetches with auth, maps response.
- `grantWalletAction` / `deductWalletAction` — input validation, BE call, error mapping (especially 422 → typed error).

**Mobile (Jest):**

- `useWalletBalance` hook — cache key, error handling.
- BalanceChip snapshot for coins/gems/zero/empty.

### Integration tests

**Boots Nest with a real test Mongo (memory replica set for transaction support):**

- End-to-end credit + debit + idempotency + concurrent debit. The test that catches schema or transaction bugs the mocked unit tests cannot see.

### E2E (Playwright)

- Player sees zero balance on first login.
- Admin opens user drawer, grants 100 coins → player's header chip and `/wallet` page reflect 100 coins.
- Admin attempts to deduct more than balance → inline error.
- `/wallet` page filters and pagination work (URL state).
- `wallet:updated` socket invalidation: admin grants while player has the page open → after `router.refresh()`, the new transaction appears.

## Edge cases & open questions

| Topic                             | Decision                                                                                                                                                 | Notes                                                                                                           |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| New users (existing accounts)     | Mongoose `default: 0` covers reads. One-time `updateMany` backfill ensures on-disk consistency.                                                          | Runs once on deploy.                                                                                            |
| User deletion                     | Out of scope for ARC-615. The ledger references `userId`. If user deletion exists or is added later, deletion semantics for the wallet are decided then. | Surface in implementation plan.                                                                                 |
| Currency rename / addition        | `currency` is a string enum. Adding `'tickets'` is a code-only change plus a `WalletReason` extension. Old ledger rows remain valid.                     | No migration needed.                                                                                            |
| Reconciliation job                | Out of scope. A nightly job verifying `sum(delta) per (userId, currency) == User.[currency]` can be added later.                                         | Drift would only show up after a transaction-handling bug, which the integration tests are designed to prevent. |
| Per-day admin caps / fraud limits | Out of scope. Single-transaction `Max(1_000_000)` is the only ceiling.                                                                                   | Add when policy is clearer.                                                                                     |
| Moderator role access             | Locked out in 615. Widen later if policy says so.                                                                                                        | Easier to widen than narrow.                                                                                    |

## Cross-cutting compliance

- File size: every new file is well under 500 lines (controllers and service split naturally).
- TypeScript: no `any`. All DTOs and BE responses are explicitly typed.
- Next.js: Server Components by default; client islands are minimal (`WalletLiveBridge`, `AdminWalletDrawer`).
- i18n: zero hardcoded user-facing strings; all five locales updated.
- BE: all DTOs validated; all routes guarded; `ConfigService` used for any future env vars.
- Tests: unit + integration + E2E coverage for all user-facing surfaces and the wallet service correctness rules.
