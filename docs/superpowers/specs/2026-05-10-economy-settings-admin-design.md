# ARC-619 — Admin-tunable Economy Settings

**Status:** approved design, ready for implementation planning
**Ticket:** ARC-619
**Date:** 2026-05-10
**Depends on:** ARC-615 (wallet foundation, merged), ARC-616/617/618 (consumers of the env-vars being migrated, all merged)

## Summary

Replace static env-var reads in `GamesService`, `GemConversionService`, and `ReferralService` with a runtime `EconomySettingsService` backed by a small Mongo collection. Env values become fallback defaults — admins override at runtime through a new `/admin/economy` page. Every change is captured in an append-only audit log. Reads go through a 60-second in-memory TTL cache so hot paths (game-win payout, conversion, referral credit) don't add a Mongo round-trip per call.

## Goals

1. Tune economy levers (game-win reward, gem→coin rate, referral coin amounts) without redeploying.
2. Preserve fresh-deploy behaviour — empty DB falls back to env, which falls back to code-level defaults.
3. Keep the hot paths fast — a single in-process map read on cache hit.
4. Record every change in an audit log so "who changed what when" is trivially answerable.
5. Stay backward-compatible with the env-var-based contract that ARC-616/617/618 documented.

## Non-goals

- No A/B testing infrastructure. One global value per key.
- No scheduled changes. Ops can do "raise Saturday, restore Monday" manually.
- No per-region or per-game-type values.
- No mobile admin UI (admin is web-only, matching prior tickets).
- No instance-to-instance broadcast on changes — 60s TTL handles drift; manual `refresh-cache` endpoint per instance is the escape hatch.
- No migration of tournament `entryFeeCoins` / `prizePoolCoins` (those are per-tournament admin-set, not global config).
- No retroactive replay of past wallet credits to match new rates.

## Key decisions

### D1 — Per-key documents (one row per knob)

**Decision:** `EconomySettings` collection with one document per key:

```ts
{ key: string, value: number, updatedBy: ObjectId, updatedAt: Date }
```

Unique index on `key`.

**Why per-key, not single doc with many fields:** adding a new knob is a single insert. Updates are scoped to one row. The audit log lives in a sibling collection rather than as embedded history. A single all-knobs doc would couple unrelated config in one Mongo write.

### D2 — TTL cache in `EconomySettingsService`

**Decision:** in-memory `Map<key, { value: number; expiresAt: number }>` with a 60s TTL. Hot reads go cache-first; misses do a single `findOne` and populate the cache. Writes invalidate the cache for that key.

**Why:** at high traffic, a game-win payout still does a single in-process map read on cache hit. No Mongo round-trip per game. The TTL bounds drift between instances (see D8).

TTL is itself configurable via `ECONOMY_CACHE_TTL_SECONDS` (env, default 60). Setting it to 0 disables caching (every read hits DB) — useful for testing.

**Public API:**

```ts
class EconomySettingsService {
  getNumber(key: EconomyKey): Promise<number>;
  setNumber(key: EconomyKey, value: number, adminUserId: string): Promise<void>;
  resetToDefault(key: EconomyKey, adminUserId: string): Promise<void>;
  listAll(): Promise<EconomySettingView[]>;
  getAuditFor(
    key: EconomyKey,
    opts?: { limit?: number; cursor?: string },
  ): Promise<EconomyAuditView[]>;
  refreshCache(): void; // clears the entire in-memory cache on this instance
}
```

`getNumber` resolution order: in-memory cache → DB row → env var → code-level default. The cache stores the resolved final number — never `undefined`/`null` — so subsequent reads stay cheap even with no override.

The `source` field returned by `listAll` follows the same resolution order and reports:

- `'override'` when a DB row exists.
- `'env'` when no DB row but the env var is set to a valid positive integer.
- `'default'` when neither a DB row nor a valid env var exists; the code-level default applies.

`refreshCache()` (public, no args) clears the entire cache on this instance. Per-key invalidation is internal: `setNumber` and `resetToDefault` invalidate only the affected key via a private `invalidateKey(key)` helper. The admin endpoint exposes only the "clear all" form.

### D3 — Typed key registry

**Decision:** a single config file at `apps/be/src/economy/economy-keys.ts`:

```ts
export const ECONOMY_KEYS_CONFIG = {
  game_win_coin_reward: { env: 'GAME_WIN_COIN_REWARD', default: 50 },
  gem_to_coin_rate: { env: 'GEM_TO_COIN_RATE', default: 100 },
  referral_reward_coins_per: { env: 'REFERRAL_REWARD_COINS_PER', default: 50 },
  referral_tier_1_bonus_coins: {
    env: 'REFERRAL_TIER_1_BONUS_COINS',
    default: 100,
  },
  referral_tier_2_bonus_coins: {
    env: 'REFERRAL_TIER_2_BONUS_COINS',
    default: 200,
  },
  referral_tier_3_bonus_coins: {
    env: 'REFERRAL_TIER_3_BONUS_COINS',
    default: 500,
  },
} as const;

export type EconomyKey = keyof typeof ECONOMY_KEYS_CONFIG;
export const ECONOMY_KEYS = Object.keys(ECONOMY_KEYS_CONFIG) as EconomyKey[];
```

**Why:** one place to add new knobs. `EconomyKey` is a string-literal union; consumers get type-safety on `getNumber('game_win_coin_reward')`. Adding the next knob (e.g. daily login bonus) is a one-line addition.

### D4 — Audit log in a separate collection

**Decision:** `EconomySettingsAudit { key, fromValue, toValue, adminUserId, createdAt }`. Append-only. Indexed `{ key: 1, createdAt: -1 }`.

**Why:** the wallet ledger doesn't cover config changes (it tracks money movement). A separate, simple audit trail makes attribution trivially queryable. Keeping audit out of the settings row itself avoids unbounded embedded-array growth.

`fromValue` is the value as observed by the resolver immediately before the change (env/default if no prior DB row). `toValue` is the new value being written, or — for a reset — the env/default value that will take effect.

### D5 — Value validation

All values are positive integers, capped at `WalletService.MAX_TRANSACTION_AMOUNT` (1_000_000) — the same cap the wallet enforces on every credit/debit. The cap is **reused** (imported), not redefined, so it never drifts.

Zero is rejected at the DTO layer. To "disable" a knob, the admin uses **Reset to default** — which removes the DB row and lets resolution fall through to env (which can itself be `0` if ops chooses, with the existing `0 disables` semantics from ARC-616/617/618).

This avoids mixed semantics where `value: 0` could mean both "set explicitly to zero" and "no override".

### D6 — Service refactors

Each of `GamesService`, `GemConversionService`, `ReferralService`:

- Loses the constructor env-read and the cached `private readonly someAmount: number` field.
- Injects `EconomySettingsService`.
- Replaces `this.someAmount` use-sites with `await this.economy.getNumber('the_key')`.

The existing fall-through to defaults is preserved by `EconomySettingsService.getNumber` itself. Existing tests are updated to provide a mock `EconomySettingsService` instead of stubbing `ConfigService` for these specific envs. Tests asserting against the env values continue to assert against the same numeric values; only the indirection changes.

### D7 — Admin web page `/admin/economy`

- Server Component table listing each key with: current value, env default, last-changed (admin name + date).
- Edit dialog per row: shows current value, input for new value, validation feedback, save button.
- "Reset to default" per row.
- Per-key audit history via a drawer that loads on demand.
- Server actions: `setEconomyValueAction(key, value)`, `resetEconomyValueAction(key)`, `loadEconomyHistoryAction(key)`. All gated server-side by `RolesGuard + @Roles('admin')`.

Pattern mirrors `/admin/tournaments` and `/admin/gem-packages` exactly.

### D8 — Cross-instance cache invalidation

**Decision:** rely on the 60s TTL. No pub/sub, no change streams, no broadcast.

**Why:** the worst case is 60s of stale values on N-1 instances after an admin change on instance 1. For an economy lever, that's acceptable — far better than the current "edit env, redeploy, restart" minutes-to-hours window. The TTL is env-tunable.

A `POST /admin/economy/refresh-cache` endpoint clears the in-memory cache on the receiving instance for ops who need immediate effect — but it doesn't broadcast. Operators with multiple instances accept the trade-off: hit each instance's URL, or wait 60s.

### D9 — Migration / first-run behaviour

No data migration. On first boot after this PR:

- DB is empty → `getNumber` falls through to env vars → behaviour identical to today.
- Admin saves a value → DB row created → that key's resolution now hits the DB row first.

Adding a `EconomySettings.onApplicationBootstrap` hook that logs a warning when an env var differs from a DB-stored value would help ops audit drift, but is **out of scope** for v1 — defer until anyone reports being confused by it.

## Data model

### `EconomySetting`

[apps/be/src/economy/schemas/economy-setting.schema.ts](apps/be/src/economy/schemas/economy-setting.schema.ts):

```ts
@Schema({ timestamps: true })
class EconomySetting {
  @Prop({ required: true, unique: true, index: true })
  key!: string; // value must be an EconomyKey at write-time

  @Prop({ required: true, type: Number, min: 1, max: 1_000_000 })
  value!: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}
```

Index: unique on `key`. (Created automatically from `unique: true`.)

### `EconomySettingsAudit`

[apps/be/src/economy/schemas/economy-settings-audit.schema.ts](apps/be/src/economy/schemas/economy-settings-audit.schema.ts):

```ts
@Schema({ timestamps: true })
class EconomySettingsAudit {
  @Prop({ required: true, index: true })
  key!: string;

  @Prop({ required: true, type: Number })
  fromValue!: number;

  @Prop({ required: true, type: Number })
  toValue!: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  adminUserId!: Types.ObjectId;
}
```

Index: `{ key: 1, createdAt: -1 }`.

## REST API

| Method   | Route                                      | Body                | Auth  | Returns                                 |
| -------- | ------------------------------------------ | ------------------- | ----- | --------------------------------------- |
| `GET`    | `/admin/economy`                           | —                   | admin | `EconomySettingView[]`                  |
| `PUT`    | `/admin/economy/:key`                      | `{ value: number }` | admin | `EconomySettingView`                    |
| `DELETE` | `/admin/economy/:key`                      | —                   | admin | 204 (reset to default)                  |
| `GET`    | `/admin/economy/:key/audit?limit=&cursor=` | —                   | admin | `EconomyAuditView[]` (default limit 50) |
| `POST`   | `/admin/economy/refresh-cache`             | —                   | admin | 204                                     |

Where:

```ts
interface EconomySettingView {
  key: EconomyKey;
  currentValue: number; // resolved (DB or env or default)
  defaultValue: number; // env or code-level default
  source: 'override' | 'env' | 'default';
  updatedAt: string | null;
  updatedByLabel: string | null; // resolved admin display name; null when no override
}

interface EconomyAuditView {
  id: string;
  fromValue: number;
  toValue: number;
  adminLabel: string;
  changedAt: string;
}
```

## Backend module

```
apps/be/src/economy/
├── economy.module.ts
├── economy-keys.ts                        # config registry
├── interfaces/
│   ├── economy-setting.interface.ts
│   └── economy-audit.interface.ts
├── schemas/
│   ├── economy-setting.schema.ts
│   └── economy-settings-audit.schema.ts
├── dto/
│   └── set-economy-value.dto.ts
├── economy-settings.service.ts
├── economy-settings.service.spec.ts
├── economy-settings.integration-spec.ts
└── admin-economy.controller.ts
```

`EconomyModule.exports` exposes `EconomySettingsService`. `GamesModule`, `GemsModule`, `ReferralModule` each import `EconomyModule` and inject the service.

`EconomyModule.imports` includes `AuthModule` (for `RolesGuard`) and `MongooseModule.forFeature` for the two new schemas.

## Web admin UI

```
apps/web/src/features/admin-economy/
├── server/
│   ├── economy.types.ts
│   ├── economy.server.ts                  # listEconomySettings(), getEconomyAudit()
│   └── economy.actions.ts                 # setEconomyValueAction, resetEconomyValueAction, loadEconomyHistoryAction
└── ui/
    ├── AdminEconomyTable.tsx              # Server Component
    ├── EconomyEditDialog.tsx              # client, useTransition
    └── EconomyAuditDrawer.tsx             # client, loads on demand

apps/web/src/app/[locale]/admin/economy/page.tsx
```

Pattern mirrors `/admin/gem-packages` (ARC-617) and `/admin/tournaments`. No new shared UI primitives needed.

## i18n

New `admin-economy` namespace in 5 web locales (en, ru, es, fr, by):

```ts
title: 'Economy settings',
table: { key: 'Key', current: 'Current value', default: 'Default', source: 'Source', lastChanged: 'Last changed', actions: 'Actions' },
sources: { override: 'Admin override', env: 'Environment', default: 'Code default' },
editDialog: { title: 'Edit {{key}}', currentLabel: 'Current', newValueLabel: 'New value', save: 'Save', cancel: 'Cancel' },
resetButton: 'Reset to default',
auditDrawer: { title: 'History for {{key}}', empty: 'No changes yet.', changedBy: 'Changed by {{name}}', changedAt: '{{date}}', from: 'From', to: 'To' },
errors: { invalidValue: 'Value must be a positive integer up to 1,000,000.', generic: 'Could not save. Please retry.' },
toasts: { saved: 'Saved {{key}} = {{value}}.', reset: 'Reset {{key}} to default.', cacheCleared: 'Cache cleared on this instance.' },
```

No wallet/referrals/payments i18n changes. No mobile changes.

## Service refactors (the consumers)

### `GamesService`

[apps/be/src/games/games.service.ts](apps/be/src/games/games.service.ts):

- Drop `private readonly gameWinCoinReward: number` and the constructor env-read.
- Constructor: drop the `ConfigService` injection if it isn't used for anything else here.
- Inject `EconomySettingsService`.
- In `payoutGameWin`, replace `this.gameWinCoinReward` with `await this.economy.getNumber('game_win_coin_reward')`.
- Spec updates: replace the `ConfigService` mock with an `EconomySettingsService` mock returning the canned values.

### `GemConversionService`

[apps/be/src/gems/services/gem-conversion.service.ts](apps/be/src/gems/services/gem-conversion.service.ts):

- Drop the `rate` field and the constructor env-read.
- Inject `EconomySettingsService`.
- `convertGemsToCoins`: `const rate = await this.economy.getNumber('gem_to_coin_rate');` and use it.
- `getRate()` (the public method used by `/wallet/conversion-rate`) becomes async — change its signature. Update the controller call site accordingly.

### `ReferralService`

[apps/be/src/referrals/referral.service.ts](apps/be/src/referrals/referral.service.ts):

- Drop `perReferralCoins`, `tierBonusCoins`, the `readPositiveInt` helper, and the constructor env-reads.
- Inject `EconomySettingsService`.
- `payoutPerReferral`: `const amount = await this.economy.getNumber('referral_reward_coins_per');` — skip wallet if 0 (the resolved value can be 0 only via env, since DTOs reject 0).
- `payoutTierBonus`: use a typed tier-to-key lookup helper inside the service so the call site has no `as EconomyKey` casts:

```ts
private readonly tierKeys = {
  1: 'referral_tier_1_bonus_coins',
  2: 'referral_tier_2_bonus_coins',
  3: 'referral_tier_3_bonus_coins',
} as const satisfies Record<number, EconomyKey>;

// In payoutTierBonus:
const key = this.tierKeys[tier];
if (!key) return;
const amount = await this.economy.getNumber(key);
```

## Validation, errors, security

- DTOs use `class-validator`. `value`: `@IsInt() @Min(1) @Max(1_000_000)`. `:key` route param validated against `ECONOMY_KEYS`; unknown keys → 404 (`economy.keyNotFound`).
- All `/admin/economy/*` routes guarded by `JwtAuthGuard + RolesGuard + @Roles('admin')`.
- `EconomySettingsService.setNumber` / `resetToDefault` require an `adminUserId` parameter (passed from the controller, taken from the JWT). The service itself does not enforce "is admin" — the controller does. Direct internal callers are trusted (and there shouldn't be any).
- `getNumber` validates the DB value the same way as env reads — if a row's `value` is somehow not a positive integer, fall back to env/default and log a warning. (Defensive — schema-level validation should prevent this.)
- Audit row write happens inside a Mongo transaction with the setting update so they commit together. **The plan commits to transactional writes** (not sequential) — same pattern the wallet uses for ledger + balance, and the cross-doc transaction is trivially cheap for two writes on a single replica set. This avoids the "phantom audit row" and "silent change with no audit" failure modes entirely.

## Tests

### BE unit

`economy-settings.service.spec.ts`:

- `getNumber` cache hit → no DB query.
- `getNumber` cache miss → DB query, value cached.
- `getNumber` DB miss + env present → env value cached.
- `getNumber` DB miss + env missing → code-level default cached.
- `getNumber` invalid DB value (e.g. 0 or non-int from a manual Mongo edit) → fall back to env/default, warn.
- `setNumber` writes setting + audit + invalidates cache.
- `setNumber` rejects invalid values (0, negative, fractional, > 1M).
- `resetToDefault` removes setting row, writes audit, invalidates cache.
- `refreshCache` clears the cache.
- `listAll` returns one view per registered key, including keys with no DB row.
- TTL expiry: stub `Date.now`, fetch at T=0 → cached, fetch at T=TTL+1 → re-reads DB.
- TTL=0 disables caching.

`admin-economy.controller.spec.ts`:

- All routes 401/403 without admin role.
- Unknown key → 404.
- DTO rejects invalid value.
- PUT happy path returns the new view.
- DELETE happy path returns 204.
- Audit GET returns the configured rows.

### BE integration (real Mongo)

`economy-settings.integration-spec.ts`:

- Set value → `GamesService.payoutGameWin` is observed using the new value on the next call.
- Set value → cache hit on the second `getNumber` call (assertion: no second DB find).
- Reset → row removed → consumer falls back to env/default.
- Audit log persisted in expected shape.

### Consumer service refactor tests

`games.service.spec.ts`, `gem-conversion.service.spec.ts`, `referral.service.spec.ts`:

- Replace `ConfigService` mocks for the migrated envs with `EconomySettingsService` mocks. Existing assertions on amounts unchanged (the service returns the same numbers; only the source changes).
- The `getRate()` signature change on `GemConversionService` requires the controller test to await — small update.

### Web Vitest

- Server module: `listEconomySettings`, `getEconomyAudit`.
- Server actions: happy paths + 4xx mappings (invalid value → typed error).
- `AdminEconomyTable` renders rows for every registered key.
- `EconomyEditDialog` calls the action with the right payload; inline validation error renders on invalid input.

### E2E

`apps/web/e2e/admin-economy/admin-economy.spec.ts` — mocked + skip-annotated, matching the established pattern.

## Cross-cutting compliance

- File size: every new file under 500 lines. The service is the largest, probably ~250 lines.
- No `any`. Strict TS.
- DTOs validated.
- Routes guarded.
- i18n keys in 5 web locales; no mobile changes.

## Edge cases & open items

| Topic                                                                  | Decision                                                                                                                                                    |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Multiple BE instances                                                  | 60s TTL drift accepted; manual `refresh-cache` endpoint per instance.                                                                                       |
| Value = 0 on PUT                                                       | Rejected at DTO. Use Reset-to-default.                                                                                                                      |
| Value > 1M                                                             | Rejected (reuses `WalletService.MAX_TRANSACTION_AMOUNT`).                                                                                                   |
| Concurrent admin writes to the same key                                | Last-write-wins. Audit captures both attempts. No optimistic locking; admin churn is low.                                                                   |
| Cache stays populated with stale value after a crash-before-invalidate | TTL bounds the staleness to 60s.                                                                                                                            |
| Removing a key from `ECONOMY_KEYS_CONFIG` after admins set values      | DB row remains but is no longer read. Admin UI hides keys not in the registry. Audit history is preserved.                                                  |
| Reading `getNumber` for a key not in the registry                      | TS prevents at call site (typed union). Runtime guard throws `BadRequestException('economy.unknownKey')` defensively.                                       |
| Test isolation — global cache between tests                            | The service exposes `refreshCache()` for tests; consumer tests call it in `afterEach`.                                                                      |
| Audit row growth                                                       | Append-only. Acceptable to let it grow. A future cleanup job can prune `> 1 year` if needed. Out of scope for v1.                                           |
| Env var still set AND DB override present                              | DB wins. The env value is "the deployment's intended default"; the DB override is "ops's intentional tweak". No warning on every read — would be too noisy. |
