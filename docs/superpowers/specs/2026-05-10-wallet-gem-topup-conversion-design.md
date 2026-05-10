# ARC-617 — Real-money Gem Top-up + Gem→Coin Conversion

**Status:** approved design, ready for implementation planning
**Ticket:** ARC-617
**Date:** 2026-05-10
**Depends on:** ARC-615 (wallet foundation, merged), ARC-616 (earn/spend loop, merged)

## Summary

Players buy gems with real money via PayPal, then convert gems to coins at a fixed rate. The gem credit lands exactly-once via the PayPal order id as the wallet idempotency key. Pending purchases (player closed browser before finalize landed) are recoverable via an explicit "Verify" UI on the wallet page. Coin → gem conversion is intentionally absent (one-way only, per ARC-615 D1).

## Goals

1. Players with money but limited time can buy gems, convert to coins, and enter tournaments.
2. Gems get credited reliably and exactly-once even under network/browser failures.
3. Conversion is atomic: a player can never see their gems debited without coins credited (or vice versa).
4. Admins can tune gem packages without redeploying.

## Non-goals

- No coin → gem conversion (one-way, per ARC-615 D1).
- No subscription-based gem rewards (the existing subscription flow stays donation-only).
- No automatic chargeback / refund handling (admin-handled via existing `WalletService.debit`).
- No cosmetics / boosts with gem prices (ARC-618+).
- No regional pricing tables (one USD-priced package list for v1).
- No PayPal webhook receiver — return-URL + verify pattern only (see D2).
- Mobile tournaments screen gap from ARC-616 is NOT in this ticket.

## Key decisions

### D1 — Fixed gem packages, admin-configurable

**Decision:** 4–5 gem packages stored in a `GemPackage` Mongo collection. Admins manage them via a new `/admin/gem-packages` page. Each package has `name`, `gems`, optional `bonusGems`, `priceUsd` (in cents), `displayOrder`, `active`.

**Why:** Players don't intuit a $/gem rate. Packages create natural price anchors and let us add tier bonuses later. Storing in Mongo means admins can adjust without code deploys.

### D2 — PayPal CAPTURE intent + order-status verification on return (no webhooks)

**Decision:** Reuse the existing `intent: 'CAPTURE'` order pattern. After PayPal redirects back to our `return_url`, the FE calls `POST /payments/gems/orders/:orderId/finalize`. The BE:

1. Calls PayPal's order GET API to verify `status === 'COMPLETED'`.
2. If verified, calls `WalletService.credit(userId, 'gems', purchase.gems, 'gem_purchase', \`gem-purchase-${orderId}\`, { orderId, packageId, amountUsd })`. The PayPal order id is the wallet idempotency key, so a duplicate finalize is a true no-op.
3. Marks the `GemPurchase` row `completed` and persists `walletTxId`.
4. Returns `{ success, gemsCredited, newBalance }`.

**Why not webhooks (yet):** PayPal webhooks need a signature-verifying receiver, retry handling, and durability infrastructure that the codebase doesn't have. The order-status-on-return path is sufficient for v1 because `WalletService` already enforces idempotency at the ledger layer — a closed browser is recoverable via D3 below.

**Why server-side verification (not just trusting the redirect):** Anyone can craft a redirect URL. The BE must confirm with PayPal that the order is genuinely captured before crediting gems.

### D3 — Pending purchase recovery

**Decision:** Persist a `GemPurchase { status: 'pending' }` row at order-creation time. The wallet page surfaces a "Verify pending purchase" banner whenever the user has any pending purchases, with a button that re-runs `finalizeOrder` on demand.

**Why:** PayPal occasionally captures successfully but the user closes the redirect tab before the finalize call lands. The pending record + verify button means no money is silently lost.

**Why not auto-poll:** Background polling is more infrastructure than v1 needs. The user opening their wallet is a sufficient liveness signal — the system isn't time-critical (the player's money is safely with PayPal until we acknowledge it).

### D4 — Gem → coin conversion at a fixed env-tunable rate

**Decision:** `GEM_TO_COIN_RATE` env var, default `100` (1 gem = 100 coins). New endpoint `POST /wallet/convert-gems-to-coins { gems: number, conversionId: string }` debits gems and credits coins atomically inside a single Mongo transaction, using the `parentSession` pattern from ARC-616.

**Why fixed rate:** Players need a stable mental model. Variable rates ("weekend bonus" etc.) are economy-tuning, not foundational.

**Why env var:** Gem → coin is a global lever (not per-package), and changing it should be a config tweak, not a code change.

**Why client-supplied `conversionId`:** Lets the caller retry safely (same id → idempotent). The contract: **the FE generates a UUID at the moment the user clicks "Convert"** and passes it on every retry. The BE rejects requests with a missing or non-UUID `conversionId` (400). Server-side generation would force the FE to handle "did the previous call land?" via a separate state machine; client-side ids keep retries simple.

### D5 — Idempotency keys

- Gem purchase credit: `gem-purchase-${paypalOrderId}`. Exactly one credit per PayPal order, no matter how many times finalize is retried.
- Gem→coin conversion: two ledger rows under one logical operation. Keys: `gem-to-coin-${conversionId}-debit` and `gem-to-coin-${conversionId}-credit`. The two-key shape lets the wallet ledger express the conversion as two adjacent rows that can be searched / audited together via metadata.

### D6 — `WalletReason` enum extension

```ts
export const WALLET_REASONS = [
  'admin_grant',
  'admin_deduct',
  'game_win',
  'tournament_entry',
  'tournament_refund',
  'tournament_prize',
  // new in ARC-617:
  'gem_purchase',
  'gem_to_coin_conversion_debit',
  'gem_to_coin_conversion_credit',
] as const;
```

Two distinct reasons for the conversion sides so the wallet history is unambiguous about what happened on each row.

### D7 — Admin gem package management

**Decision:** New `/admin/gem-packages` page with CRUD form. Active packages are visible to all players; inactive ones are admin-only. Admins can sort packages via `displayOrder`.

**Why:** Mirrors the `admin-tournaments` and `admin-announcements` patterns already established in the codebase.

### D8 — Web `/wallet` page additions

- **GemStore section** — Server Component listing active gem packages with "Buy" buttons.
- **PendingGemPurchases banner** — Server Component shown only when the user has pending purchases. "Verify" button calls a server action that re-runs finalize.
- **ConvertGemsForm** — small inline client component with a gems input + computed coins preview + confirm button.
- **i18n** — new keys for store copy, conversion copy, and the three new reason labels.

### D9 — Mobile parity (read + buy + convert)

Mobile wallet screen gets the same three additions: gem store list, pending purchase banner, conversion form. PayPal redirect uses `expo-web-browser` (`openAuthSessionAsync`) which returns control to the app on redirect — at which point the screen calls finalize. No mobile admin surface (consistent with prior tickets).

## Data model

### `GemPackage` collection (new)

```ts
@Schema({ timestamps: true })
class GemPackage {
  @Prop({ required: true, maxlength: 100 }) name!: string;
  @Prop({ required: true, type: Number, min: 1, max: 1_000_000 }) gems!: number;
  @Prop({ type: Number, min: 0, max: 1_000_000, default: 0 })
  bonusGems!: number;
  @Prop({ required: true, type: Number, min: 1, max: 100_000 })
  priceUsd!: number; // cents
  @Prop({ type: Number, default: 0 }) displayOrder!: number;
  @Prop({ type: Boolean, default: true }) active!: boolean;
}
```

Index: `{ active: 1, displayOrder: 1 }` for the public list.

### `GemPurchase` collection (new)

```ts
@Schema({ timestamps: true })
class GemPurchase {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'GemPackage' })
  packageId!: Types.ObjectId;

  @Prop({ required: true, unique: true })
  paypalOrderId!: string;

  @Prop({ required: true, type: Number })
  amountUsd!: number; // cents

  @Prop({ required: true, type: Number, min: 1, max: 2_000_000 })
  gems!: number; // base + bonus at purchase time, frozen

  @Prop({
    required: true,
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  })
  status!: 'pending' | 'completed' | 'failed' | 'cancelled';

  @Prop({ type: Types.ObjectId, ref: 'WalletTransaction' })
  walletTxId?: Types.ObjectId;

  @Prop() finalizedAt?: Date;
}
```

Indexes: `{ userId: 1, status: 1, createdAt: -1 }`, unique on `paypalOrderId`.

## Backend integration

### New `GemsModule` at `apps/be/src/gems/`

```
apps/be/src/gems/
├── gems.module.ts
├── schemas/
│   ├── gem-package.schema.ts
│   └── gem-purchase.schema.ts
├── interfaces/
│   ├── gem-package.interface.ts
│   ├── gem-purchase.interface.ts
│   └── conversion.interface.ts
├── dto/
│   ├── create-gem-package.dto.ts
│   ├── update-gem-package.dto.ts
│   ├── create-gem-order.dto.ts
│   └── convert-gems.dto.ts
├── services/
│   ├── gem-packages.service.ts
│   ├── gem-purchases.service.ts
│   ├── gem-conversion.service.ts
│   └── paypal.gateway.ts          // shared PayPal helper (extracted from PaymentsService)
├── controllers/
│   ├── public-gem-packages.controller.ts
│   ├── admin-gem-packages.controller.ts
│   └── gem-purchases.controller.ts
└── lib/
    └── gems-bootstrap.ts          // optional: seed default packages on first deploy
```

Imports: `WalletModule`, `ConfigModule`, `AuthModule` (for `RolesGuard`), `MongooseModule.forFeature` for both new collections + `WalletTransaction`.

### Service contracts

```ts
class GemPackagesService {
  listActive(): Promise<GemPackagePublic[]>;
  listAllForAdmin(): Promise<GemPackageAdmin[]>;
  create(dto: CreateGemPackageDto): Promise<GemPackageAdmin>;
  update(id: string, dto: UpdateGemPackageDto): Promise<GemPackageAdmin>;
  delete(id: string): Promise<void>; // hard delete only if no pending purchases
}

class GemPurchasesService {
  createOrder(
    userId: string,
    packageId: string,
  ): Promise<{
    paypalOrderId: string;
    approveUrl: string;
  }>;

  finalizeOrder(
    userId: string,
    paypalOrderId: string,
  ): Promise<{
    success: boolean;
    gemsCredited: number;
    newBalance: WalletBalance;
  }>;

  listPendingForUser(userId: string): Promise<GemPurchaseView[]>;
}

class GemConversionService {
  convertGemsToCoins(
    userId: string,
    gems: number,
    conversionId: string,
  ): Promise<{
    gemsDebited: number;
    coinsCredited: number;
    newBalance: WalletBalance;
  }>;
}

class PaypalGateway {
  // Extracted from the existing PaymentsService PayPal calls.
  authToken(): Promise<string>;
  createOrder(input: {
    amountUsd: number;
    description: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<{ orderId: string; approveUrl: string }>;
  getOrder(orderId: string): Promise<{
    status:
      | 'CREATED'
      | 'APPROVED'
      | 'COMPLETED'
      | 'VOIDED'
      | 'PAYER_ACTION_REQUIRED';
  }>;
}
```

The existing `PaymentsService` continues to work but begins to use `PaypalGateway` for the auth + order-create primitives — a small refactor that pays dividends here. The donation flow is otherwise unchanged.

### REST endpoints

| Method | Route                                     | Body                                     | Auth        | Returns                                      |
| ------ | ----------------------------------------- | ---------------------------------------- | ----------- | -------------------------------------------- |
| GET    | `/payments/gems/packages`                 | —                                        | none        | `GemPackagePublic[]`                         |
| POST   | `/payments/gems/orders`                   | `{ packageId: string }`                  | JWT         | `{ paypalOrderId; approveUrl }`              |
| POST   | `/payments/gems/orders/:orderId/finalize` | —                                        | JWT         | `{ success; gemsCredited; newBalance }`      |
| GET    | `/payments/gems/orders/pending`           | —                                        | JWT         | `GemPurchaseView[]`                          |
| POST   | `/wallet/convert-gems-to-coins`           | `{ gems: number; conversionId: string }` | JWT         | `{ gemsDebited; coinsCredited; newBalance }` |
| GET    | `/admin/gem-packages`                     | —                                        | JWT + admin | `GemPackageAdmin[]`                          |
| POST   | `/admin/gem-packages`                     | `CreateGemPackageDto`                    | JWT + admin | `GemPackageAdmin`                            |
| PATCH  | `/admin/gem-packages/:id`                 | `UpdateGemPackageDto`                    | JWT + admin | `GemPackageAdmin`                            |
| DELETE | `/admin/gem-packages/:id`                 | —                                        | JWT + admin | `204`                                        |

### `convertGemsToCoins` flow

```ts
async convertGemsToCoins(userId, gems, conversionId): Promise<...> {
  if (!Number.isInteger(gems) || gems <= 0 || gems > 1_000_000) {
    throw new BadRequestException('gems.invalidAmount');
  }
  const coins = gems * this.gemToCoinRate;
  if (coins > WalletService.MAX_TRANSACTION_AMOUNT) {
    // Reuse the wallet's per-transaction cap (1_000_000 from ARC-615) so the
    // limit can never drift between the conversion endpoint and the wallet
    // service. Reject before the wallet does so the message is gem-specific.
    throw new BadRequestException('gems.conversionExceedsCap');
  }

  const session = await this.connection.startSession();
  try {
    let result!: { ... };
    await session.withTransaction(async () => {
      // Debit gems first; if insufficient, this throws and the transaction aborts
      // before any coins are credited.
      await this.wallet.debit(
        userId, 'gems', gems,
        'gem_to_coin_conversion_debit',
        `gem-to-coin-${conversionId}-debit`,
        { conversionId, rate: this.gemToCoinRate },
        session,
      );
      await this.wallet.credit(
        userId, 'coins', coins,
        'gem_to_coin_conversion_credit',
        `gem-to-coin-${conversionId}-credit`,
        { conversionId, rate: this.gemToCoinRate },
        session,
      );
      result = { gemsDebited: gems, coinsCredited: coins };
    });
    const balance = await this.wallet.getBalance(userId);
    this.wallet.emitAfterCommit(userId, balance);
    return { ...result, newBalance: balance };
  } catch (err) {
    if (looksLikeDuplicateKey(err)) {
      // Idempotent retry: if both debit and credit ledger rows exist for this
      // conversionId, treat as success. If only one exists, surface the error
      // — partial state requires manual investigation (shouldn't happen because
      // both rows are inside the same transaction, but defensive).
      const debitPrior = await this.wallet.findByIdempotencyKey(`gem-to-coin-${conversionId}-debit`);
      const creditPrior = await this.wallet.findByIdempotencyKey(`gem-to-coin-${conversionId}-credit`);
      if (debitPrior && creditPrior) {
        return { gemsDebited: gems, coinsCredited: coins, newBalance: await this.wallet.getBalance(userId) };
      }
    }
    throw err;
  } finally {
    await session.endSession();
  }
}
```

### `finalizeOrder` flow

```ts
async finalizeOrder(userId, paypalOrderId): Promise<...> {
  const purchase = await this.gemPurchaseModel.findOne({
    paypalOrderId, userId: new Types.ObjectId(userId),
  });
  if (!purchase) throw new NotFoundException('gems.orderNotFound');

  // Idempotent fast path.
  if (purchase.status === 'completed') {
    return { success: true, gemsCredited: 0, newBalance: await this.wallet.getBalance(userId) };
  }
  if (purchase.status === 'failed' || purchase.status === 'cancelled') {
    throw new BadRequestException('gems.orderNotEligible');
  }

  // Verify with PayPal.
  const paypalOrder = await this.paypal.getOrder(paypalOrderId);
  if (paypalOrder.status !== 'COMPLETED') {
    if (paypalOrder.status === 'VOIDED') {
      purchase.status = 'failed';
      await purchase.save();
    }
    throw new BadRequestException('gems.orderNotCaptured');
  }

  // Credit gems with the PayPal order id as the idempotency key.
  // No `parentSession` here on purpose: this is a single wallet write with
  // no other side effects in the same transaction (the GemPurchase row update
  // happens after the credit completes — the wallet's idempotency layer makes
  // a partial-state retry safe). Compare with `convertGemsToCoins` which DOES
  // need parentSession because it does two atomic writes.
  const tx = await this.wallet.credit(
    userId, 'gems', purchase.gems,
    'gem_purchase',
    `gem-purchase-${paypalOrderId}`,
    {
      paypalOrderId,
      packageId: String(purchase.packageId),
      amountUsd: purchase.amountUsd,
    },
  );

  purchase.status = 'completed';
  purchase.walletTxId = new Types.ObjectId(tx.id);
  purchase.finalizedAt = new Date();
  await purchase.save();

  return {
    success: true,
    gemsCredited: purchase.gems,
    newBalance: await this.wallet.getBalance(userId),
  };
}
```

## Web UI

### `/wallet` page extensions

```
apps/web/src/features/gems/
├── server/
│   ├── gems.server.ts            // getActivePackages, getPendingPurchases (Server Component fetches)
│   └── gems.actions.ts           // buyGemsAction, finalizeGemPurchaseAction, convertGemsAction
├── ui/
│   ├── GemStore.tsx              // Server Component — lists active packages
│   ├── GemPackageCard.tsx        // Server Component — single card
│   ├── PendingGemPurchases.tsx   // Server Component — banner shown when pending exists
│   ├── ConvertGemsForm.tsx       // Client component
│   └── BuyGemsButton.tsx         // Client component — calls server action, redirects to PayPal
└── server/gems.types.ts
```

`/wallet` page composes these alongside the existing wallet content. The chip in the header (ARC-615) is unchanged — it already shows both balances; players see their gems update after finalize.

### Admin

```
apps/web/src/features/admin-gem-packages/
├── server/admin-gems.actions.ts   // createPackageAction, updatePackageAction, deletePackageAction
├── ui/
│   ├── AdminGemPackagesTable.tsx
│   └── AdminGemPackageForm.tsx
```

Page at `apps/web/src/app/[locale]/admin/gem-packages/page.tsx`.

## Mobile UI

```
apps/mobile/features/gems/
├── api/
│   ├── usePackages.ts            // TanStack Query: GET /payments/gems/packages
│   ├── usePendingPurchases.ts    // TanStack Query: GET /payments/gems/orders/pending
│   ├── useBuyGems.ts             // mutation: createOrder + open PayPal
│   ├── useFinalizeGemPurchase.ts // mutation: finalize on return
│   └── useConvertGems.ts         // mutation: convert
└── ui/
    ├── GemStoreList.tsx
    ├── PendingGemPurchasesBanner.tsx
    └── ConvertGemsForm.tsx
```

Wallet screen composes these. PayPal redirect uses `expo-web-browser.openAuthSessionAsync`, which resolves with `{ type: 'success', url }` when PayPal redirects back to the deep link, or `{ type: 'cancel' }` if the user dismisses the auth sheet. On `success`, extract `orderId` from the URL and call finalize. On `cancel`, leave the `GemPurchase` row in `pending` state and rely on the Verify banner (D3) for recovery the next time the user opens the wallet.

## i18n

**New keys, web (5 locales: en/ru/es/fr/by):**

`pages/wallet/{locale}.ts` reasons block:

```ts
gem_purchase: 'Gems purchased',
gem_to_coin_conversion_debit: 'Converted gems to coins',
gem_to_coin_conversion_credit: 'Coins from conversion',
```

New `pages/gems/{locale}.ts`:

```ts
store: {
  title: 'Buy gems',
  pricePer: 'Price',
  bonusBadge: '+{{n}} bonus',
  buyButton: 'Buy with PayPal',
  noPackages: 'No packages available right now.',
},
pending: {
  banner: 'You have {{n}} pending purchase(s).',
  verify: 'Verify',
  verifying: 'Verifying…',
  failed: 'Could not verify. Try again or contact support.',
},
convert: {
  title: 'Convert gems to coins',
  rateLabel: 'Rate',
  inputLabel: 'Gems to convert',
  resultLabel: 'You will receive',
  confirm: 'Convert',
  insufficient: 'Not enough gems to convert.',
},
errors: {
  paypalUnavailable: 'PayPal is unavailable. Please try again later.',
  orderNotCaptured: 'Payment was not captured. Try again or contact support.',
  invalidAmount: 'Amount must be a positive integer.',
  conversionExceedsCap: 'Conversion exceeds the per-transaction cap.',
},
```

New `pages/admin-gem-packages/{locale}.ts`:

```ts
title: 'Gem packages',
table: { name: 'Name', gems: 'Gems', bonus: 'Bonus', price: 'Price (USD)', order: 'Order', active: 'Active', actions: 'Actions' },
form: { /* labels + buttons */ },
errors: { /* validation surfaces */ },
```

**Mobile (3 locales: en/es/fr):** same keys via the existing single-file mobile i18n pattern.

## Validation, errors, security

- DTOs use `class-validator`. `@IsMongoId`, `@IsInt`, `@Min`, `@Max`, `@MaxLength`, `@IsBoolean`, `@IsOptional`.
- All player routes guarded by `JwtAuthGuard`. Admin routes additionally guarded by `RolesGuard` + `@Roles('admin')`.
- The `convertGemsToCoins` endpoint validates the user owns the gems being debited (the wallet's `$gte` guard handles this).
- `paypalOrderId` is unique-indexed; concurrent finalize calls deterministically result in one credit.
- Errors:
  - `gems.invalidAmount` — 400
  - `gems.orderNotFound` — 404
  - `gems.orderNotCaptured` — 400
  - `gems.orderNotEligible` — 400 (already failed/cancelled)
  - `wallet.insufficientFunds` — 422 (existing from ARC-615)
  - `gems.conversionExceedsCap` — 400
  - `gems.paypalUnavailable` — 502 (when PayPal API itself errors)

## Tests

### BE unit

- `GemPackagesService` CRUD (create / update / delete-when-no-pending-purchases / list).
- `GemPurchasesService.createOrder` — calls PayPal, persists pending row, returns approve URL.
- `GemPurchasesService.finalizeOrder` — happy path; idempotent on repeat; rejects when PayPal status not `COMPLETED`; rejects when purchase status is `failed`/`cancelled`.
- `GemConversionService.convertGemsToCoins` — happy path debits and credits atomically; insufficient gems throws and no coins are credited; rate is read from env; idempotent on retry with same `conversionId`.

### BE integration (real Mongo replica set)

- End-to-end `createOrder` → mocked PayPal `getOrder` returns `COMPLETED` → `finalizeOrder` → wallet shows gems + ledger has the row + GemPurchase is `completed`.
- Concurrent `finalizeOrder` on the same orderId: only one credit happens; both calls return success.
- `convertGemsToCoins` atomicity — force a wallet failure mid-transaction; balance is untouched and no ledger rows exist.
- `convertGemsToCoins` idempotency — call twice with the same `conversionId`; second call is a no-op.

### Web Vitest

- Server module fetches.
- Server actions (buy / finalize / convert) — happy paths + 4xx/5xx mappings.
- `GemStore` rendering, `PendingGemPurchases` banner, `ConvertGemsForm` math + submit.

### Mobile Jest

- Hook tests for `usePackages`, `useFinalizeGemPurchase`, `useConvertGems`.
- Component tests for `GemStoreList` and `ConvertGemsForm`.

### E2E (Playwright)

- Mocked specs scaffolded with `test.skip` placeholders documenting the live-flow requirements (PayPal sandbox creds + seeded test player).

## Cross-cutting compliance

- File size: every new file under 500 lines.
- TypeScript: no `any`. Strict typing throughout.
- Server Components + Server Actions for the wallet-touching FE on web (per ARC-615/616 convention; intentional divergence from project default TanStack Query for wallet feature only). Mobile uses TanStack Query.
- i18n: zero hardcoded user-facing strings.
- Wallet writes: only via `WalletService` (ESLint guardrail from ARC-615 still active).
- DTOs validated. Routes guarded.
- No new env vars beyond `GEM_TO_COIN_RATE` (default 100). PayPal env vars from the existing donation flow are reused.

## Edge cases & open questions

| Topic                                                       | Decision                                                                                                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pending purchase older than 24h                             | Stays pending. Verify button still works. Background sweep (mark stale as `failed`) is future scope.                                                                     |
| Player abandons PayPal redirect                             | Pending row stays `pending`. Verify banner on next wallet visit recovers.                                                                                                |
| PayPal returns `VOIDED` / `DECLINED`                        | `finalizeOrder` marks purchase `failed`, no credit.                                                                                                                      |
| Player closes app on mobile during PayPal                   | Same as web — pending row + verify on next visit.                                                                                                                        |
| Refunds / chargebacks                                       | Out of scope; admin uses the existing wallet drawer to debit gems if needed.                                                                                             |
| Currency other than USD                                     | Out of scope. Packages are USD-priced; PayPal converts at checkout if the buyer's source funds are non-USD.                                                              |
| `GEM_TO_COIN_RATE` change while users mid-conversion        | Stable per call (read once at module init like ARC-616's `GAME_WIN_COIN_REWARD`). Restart applies new value.                                                             |
| Deleting a `GemPackage` with completed purchases            | Allowed (purchases reference by id; the delete only affects the public list). The plan should make this explicit so admins can prune old SKUs without orphaning history. |
| Deleting a package while a `pending` purchase exists for it | Reject — purchases would otherwise hang with a dangling reference.                                                                                                       |
