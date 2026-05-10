# ARC-618 — Referral Coin Rewards

**Status:** approved design, ready for implementation planning
**Ticket:** ARC-618
**Date:** 2026-05-10
**Depends on:** ARC-615 (wallet foundation, merged), ARC-616 (earn/spend loop, merged)

## Summary

Reward referrers with coins when a friend signs up using their referral code. Two payouts on every successful `trackReferral`:

1. **Per-referral bonus** — flat coin amount (default 50) for every successful referral.
2. **Tier bonus** — additional one-time coins when the referrer crosses each existing reward tier (3 / 5 / 10 invites). Defaults: 100 / 200 / 500.

Reuses the existing referrals lifecycle and the `WalletService.credit` API from ARC-615; no new schemas, no new endpoints, no admin tool. Adds two new `WalletReason` enum values and four env-tunable amounts.

## Goals

1. Give players a non-purchase, organic way to earn coins.
2. Encourage referral activity by making each individual referral feel rewarding (per-referral bonus) and by reinforcing existing tier moments (tier bonus).
3. Mint coins reliably and exactly-once via deterministic idempotency keys.
4. Wallet failures must never block a successful referral signup.

## Non-goals

- No coin reward for the **referred** user (the signup-bonus side). The existing `referredBy` field doesn't grant anything today; we keep it that way until product asks for the asymmetric "both sides win" flow.
- No retroactive backfill — referrers with historical referrals from before this ticket don't get coins for them. (A future ops cleanup job could compute and grant; out of scope.)
- No new admin tools. Existing `/admin/users` wallet drawer is sufficient for any manual corrections.
- No subscription-based coin stipend.
- No referral-code cosmetics or storefront changes.

## Key decisions

### D1 — Two coin rewards, both via WalletService

**Per-referral**: every successful `trackReferral` call credits `REFERRAL_REWARD_COINS_PER` coins (env, default 50) to the referrer.

**Tier bonus**: every time the referrer's total completed referrals crosses an existing tier threshold, credit an additional one-time bonus. The tier table (in `referral.service.ts`) stays as-is:

| Tier | Required invites | Existing rewards                        | New env-tunable coin bonus                  |
| ---- | ---------------- | --------------------------------------- | ------------------------------------------- |
| 1    | 3                | Social Butterfly badge                  | `REFERRAL_TIER_1_BONUS_COINS` (default 100) |
| 2    | 5                | Early Access: The Heist                 | `REFERRAL_TIER_2_BONUS_COINS` (default 200) |
| 3    | 10               | Cursed Banquet + Legend Recruiter badge | `REFERRAL_TIER_3_BONUS_COINS` (default 500) |

A player who hits tier 1 on their 3rd referral receives `50 + 100 = 150` coins on that single `trackReferral` call. Tier 2 on the 5th referral adds another `50 + 200 = 250`. Tier 3 on the 10th adds `50 + 500 = 550`.

**Why both rewards:** a single per-referral payout is predictable but lacks milestones; a single tier-only payout makes the first two referrals feel unrewarding. Combining gives a constant ramp plus standout moments.

### D2 — Deterministic idempotency keys

Both payouts rely on `WalletService`'s mandatory `idempotencyKey` (from ARC-615):

- Per-referral: `referral-${referralId}-payout-${referrerId}` — the Mongo `_id` of the newly-created `Referral` row ensures uniqueness across all referrals globally.
- Tier bonus: `referral-tier-${referrerId}-${tier}` — one per `(referrer, tier)` pair. `checkAndGrantRewards` already iterates all tiers on every call (re-checking on the 4th, 5th, 6th referrals after tier 1 is already passed); the wallet's idempotency layer makes the repeated credits no-ops.

**Why these keys:** they survive replays (e.g. an at-most-once worker fires `checkAndGrantRewards` twice) without double-paying.

### D3 — Wallet failure is non-fatal to the referral

Per the established ARC-616 game-win pattern: any exception from `wallet.credit` is caught, logged via `this.logger.warn`, and swallowed. The referral is still recorded; the signup still succeeds.

**Why:** the referred user's signup must never fail because of a wallet hiccup. Losing one player's 50-coin reward is preferable to losing a new signup. Manual recovery via the existing admin wallet drawer is always available.

### D4 — `WalletReason` enum additions

```ts
export const WALLET_REASONS = [
  // existing...
  'gem_purchase',
  'gem_to_coin_conversion_debit',
  'gem_to_coin_conversion_credit',
  // new in ARC-618:
  'referral_bonus',
  'referral_tier_bonus',
] as const;
```

Two reasons (not one) so wallet history makes it clear whether a payout came from an individual referral or from crossing a milestone.

### D5 — No new schemas

The existing `Referral` and `ReferralReward` collections remain unchanged. The wallet ledger naturally records every payout, and `WalletTransaction.metadata` carries the per-payout context (`referralId`, `referredUserId`, `tier`, `requiredInvites`).

**Why not add a `coin_reward` row to `ReferralReward`:** the wallet ledger is already the source of truth for coin movements. A parallel "coins earned" record would drift; aggregating ledger rows by `metadata.referralId` is the right query if we ever need it.

### D6 — Module wiring

`ReferralModule.imports += WalletModule`. `ReferralService` injects `WalletService` and `ConfigService` (the latter for env reads at module init).

### D7 — Configuration

Four env vars, all positive integers:

- `REFERRAL_REWARD_COINS_PER` — default 50.
- `REFERRAL_TIER_1_BONUS_COINS` — default 100.
- `REFERRAL_TIER_2_BONUS_COINS` — default 200.
- `REFERRAL_TIER_3_BONUS_COINS` — default 500.

Read once in the constructor, validated as positive integers; invalid values fall back to defaults with a warning log.

## Service integration

### `ReferralService.trackReferral` — extended

```ts
async trackReferral(referralCode: string, referredUserId: string): Promise<void> {
  const referrer = await this.userModel.findOne({ referralCode }).exec();
  if (!referrer) {
    this.logger.warn(`Invalid referral code: ${referralCode}`);
    return;
  }
  const referrerId = (referrer as UserDocument).id as string;
  if (referrerId === referredUserId) {
    this.logger.warn('User cannot refer themselves');
    return;
  }
  const existing = await this.referralModel.findOne({ referredUserId });
  if (existing) {
    this.logger.warn(`User ${referredUserId} already has a referral`);
    return;
  }

  const referral = await this.referralModel.create({
    referrerId,
    referredUserId,
    status: 'completed',
    completedAt: new Date(),
  });

  await this.userModel.findByIdAndUpdate(referredUserId, { referredBy: referrerId });

  await this.payoutPerReferral(referrerId, String(referral._id), referredUserId);
  await this.checkAndGrantRewards(referrerId);
}

private async payoutPerReferral(
  referrerId: string,
  referralId: string,
  referredUserId: string,
): Promise<void> {
  if (this.perReferralCoins <= 0) return;
  try {
    await this.wallet.credit(
      referrerId,
      'coins',
      this.perReferralCoins,
      'referral_bonus',
      `referral-${referralId}-payout-${referrerId}`,
      { referralId, referredUserId },
    );
  } catch (err) {
    this.logger.warn(
      `Referral coin payout failed for ${referrerId} on referral ${referralId}: ${(err as Error).message}`,
    );
  }
}
```

### `ReferralService.checkAndGrantRewards` — extended

The existing badge / early-access grant loop stays. Add a tier-coin call at the same tier-crossing point:

```ts
private async checkAndGrantRewards(userId: string): Promise<void> {
  const totalReferrals = await this.referralModel.countDocuments({
    referrerId: userId,
    status: 'completed',
  });

  for (const tier of REWARD_TIERS) {
    if (totalReferrals < tier.requiredInvites) continue;

    // ... existing reward-grant loop (unchanged) ...

    await this.payoutTierBonus(userId, tier.tier, tier.requiredInvites);
  }
}

private async payoutTierBonus(
  referrerId: string,
  tier: number,
  requiredInvites: number,
): Promise<void> {
  const amount = this.tierBonusCoins[tier];
  if (!amount || amount <= 0) return;
  try {
    await this.wallet.credit(
      referrerId,
      'coins',
      amount,
      'referral_tier_bonus',
      `referral-tier-${referrerId}-${tier}`,
      { tier, requiredInvites },
    );
  } catch (err) {
    this.logger.warn(
      `Referral tier bonus failed for ${referrerId} tier ${tier}: ${(err as Error).message}`,
    );
  }
}
```

The deterministic `referral-tier-${referrerId}-${tier}` key means a second `checkAndGrantRewards` call (e.g. on the 4th referral after the 3rd already crossed tier 1) attempts the credit again, hits the wallet's idempotency layer, gets the prior tx back, and no double-credit occurs.

### Constructor — env reads

```ts
constructor(
  @InjectModel(Referral.name) private readonly referralModel: Model<Referral>,
  @InjectModel(ReferralReward.name) private readonly rewardModel: Model<ReferralReward>,
  @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  private readonly wallet: WalletService,
  private readonly config: ConfigService,
) {
  this.perReferralCoins = this.readPositiveInt('REFERRAL_REWARD_COINS_PER', 50);
  this.tierBonusCoins = {
    1: this.readPositiveInt('REFERRAL_TIER_1_BONUS_COINS', 100),
    2: this.readPositiveInt('REFERRAL_TIER_2_BONUS_COINS', 200),
    3: this.readPositiveInt('REFERRAL_TIER_3_BONUS_COINS', 500),
  };
}

private readPositiveInt(name: string, fallback: number): number {
  const raw = this.config.get<string>(name);
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (Number.isInteger(parsed) && parsed > 0) return parsed;
  this.logger.warn(`Invalid ${name}="${raw}"; using default ${fallback}`);
  return fallback;
}
```

## REST API

No new endpoints. `getReferralStats` continues to return its existing payload; the wallet history at `/wallet/transactions` already shows referral payouts via the new reason values.

**Optional, low-priority enhancement** (not in scope but easy follow-up): `getReferralStats` could compute a `coinsEarned` total by aggregating wallet transactions where `reason in ['referral_bonus', 'referral_tier_bonus']` and `userId === referrerId`. The aggregation keys on `WalletTransaction.userId` directly (which is already the referrer for these rows) — **not** on a `metadata.referrerId` field — so no metadata migration is needed when this enhancement lands. Defer to ARC-619+.

## Web UI

- **`/referrals` page** — surface coin amounts in the "how it works" / tier-rewards UI:
  - Add a "+N coins per friend" line in the explainer.
  - Each tier row gets a "+N coin bonus" annotation alongside the existing badge / early-access reward.
- **`/wallet` page** — no code changes. New reason labels (`referral_bonus`, `referral_tier_bonus`) render via the existing `TransactionRow` once i18n keys are added.
- No admin UI changes.

## Mobile UI

- Mobile wallet screen: new reason labels via i18n (no code changes).
- Mobile referrals screen, if it exists today, gets the same copy update. Otherwise out of scope.

## i18n

**Web (5 locales — en, ru, es, fr, by):**

- `pages/wallet/{locale}.ts` — add two reason keys:
  ```ts
  referral_bonus: 'Referral bonus',
  referral_tier_bonus: 'Referral tier bonus',
  ```
- `pages/referrals/{locale}.ts` (or wherever the namespace lives) — add:
  ```ts
  coinReward: {
    perFriend: '+{{coins}} coins per friend',
    tierBonus: '+{{coins}} coin bonus',
  },
  ```

**Mobile (3 locales — en, es, fr):**

- Single-file pattern; same keys.

## Validation, errors, security

- `wallet.credit` parameters validated by the wallet itself: positive integer ≤ `MAX_TRANSACTION_AMOUNT` (1_000_000). Env defaults (50, 100, 200, 500) are far below the cap.
- Idempotency keys are deterministic; replays are safe.
- Existing referral validation (self-referral, duplicate signup) is unchanged and runs before any wallet call.
- Wallet failures are caught and logged; signup never fails because of wallet downtime.

## Tests

### BE unit

`referral.service.spec.ts` (extended):

- `trackReferral` happy path calls `wallet.credit` once with the per-referral args.
- Self-referral / invalid code / duplicate: no wallet call.
- Tier crossing fires the tier bonus once.
- Already-passed tier doesn't fire again (verified by checking `wallet.credit` call count on the 4th referral after 3rd crossed tier 1).
- `wallet.credit` failure on per-referral or tier path: logged, doesn't throw.
- Env-zero `REFERRAL_REWARD_COINS_PER=0` skips the wallet call entirely.
- Tier with zero bonus: skips tier wallet call.

### BE integration

`referral.service.integration-spec.ts` (new — pattern from `wallet.service.integration-spec.ts`):

- End-to-end: real Mongo replica set, real WalletModule + ReferralModule, real models. `trackReferral` once → ledger row exists, balance = 50.
- Three referrals → balance = 150 + 100 (tier 1) = 250. Ledger has 4 rows (3 per-referral + 1 tier).
- Five referrals → balance = 250 + 50 + 50 + 200 = 550. Two per-referral rows added + tier 2 row.
- Retry-safe: simulate a duplicate `trackReferral` (which the existing duplicate-check prevents writing a Referral row twice). Verify ledger still has exactly one per-referral row for each tracked referral.

### Web Vitest

- `/referrals` page renders the new coin copy.

### Mobile Jest

- Mobile wallet `TransactionRow` snapshot (if applicable) includes the new reason labels.

### E2E (Playwright)

One spec scaffolded with `test.skip(true, ...)` placeholder documenting the live-test requirements (test DB + sandbox auth flow with a referral code).

## Cross-cutting compliance

- File-size: every modified file stays under the 500-line limit. `referral.service.ts` is currently around 215 lines; the additions are ~50 lines, ending around 265.
- TypeScript: no `any`.
- ESLint guardrail from ARC-615 still applies — only `WalletService` writes `coins`. The referral service goes through the public API.
- No new DTOs / no new routes / no new admin tooling.
- All user-facing strings via i18n.

## Edge cases & open items

| Topic                                         | Decision                                                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Existing referrers with historical referrals  | No retroactive backfill. They earn from this ticket forward. Manual admin grants via wallet drawer if product asks. |
| Self-referral                                 | Rejected by existing validation. No wallet involvement.                                                             |
| Duplicate signup (same `referredUserId`)      | Rejected by existing validation. No wallet involvement.                                                             |
| `REFERRAL_REWARD_COINS_PER=0`                 | Per-referral path skipped entirely.                                                                                 |
| Tier bonus env=0                              | That specific tier skipped.                                                                                         |
| `checkAndGrantRewards` called repeatedly      | Wallet idempotency layer makes second+ call a no-op. Verified by integration test.                                  |
| Wallet down at trackReferral time             | Logged warning; referral row still committed. Coins not credited. Can be backfilled manually.                       |
| Referral code revoked / deleted after success | Doesn't affect already-credited coins. Future deletion of `Referral` rows is out of scope.                          |
| Currency choice: gems vs coins                | Coins only. Gems are real-money premium currency; referrals are a soft-economy mechanism.                           |
