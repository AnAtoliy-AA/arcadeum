# Daily Playing Rewards — Design (ARC-621)

## Goal

Reward users with coins once per UTC day via a manual "Claim" action, with an escalating 7-day streak that resets if the user misses a day. Daily reward values are admin-tunable through the existing economy settings.

This continues the wallet/economy roadmap established in ARC-615 and runs on the rails already shipped (wallet ledger, idempotency, admin-tunable economy values, real-time wallet bridge).

## Scope

- BE: new `daily-rewards` module with claim + read endpoints; 7 new admin-tunable economy keys.
- Web: a `DailyRewardCard` widget surfaced on the wallet page (primary) and home page (compact variant).
- Admin: no new UI — the 7 reward keys appear automatically in the existing admin economy table via the `EconomyKey` registry.

## Non-goals

- No gems-as-daily-reward — coins only.
- No push notifications or scheduled jobs.
- No retroactive backfill for old users — every user starts with `currentStreak: 0` on their first claim attempt.

## User-facing behavior

- **Claim button** is available once per UTC day. After claim it disables and shows a countdown to next UTC midnight.
- **Streak.** 7-day cycle. Each successful claim awards the coin amount for `currentStreak + 1` (clamped to 7), then increments `currentStreak`. After claiming Day 7 the next valid claim wraps the streak counter back to 1.
- **Miss a day.** If `lastClaimedDay` is older than yesterday (UTC) on the next claim, the streak resets to 1 before payout.
- **Visual.** 7 stamps in a row; the next-to-claim stamp is highlighted; claimed stamps for the current cycle are checked; locked stamps are dimmed. A toast appears on successful claim and the header balance updates in real-time over the existing `WalletLiveBridge` socket.

## Architecture

### Backend

New module `apps/be/src/daily-rewards/`:

- `DailyRewardsModule` — wires controller + service + Mongoose schema.
- `DailyRewardsController`
  - `GET /daily-rewards/me` → `{ canClaim, nextDay, currentStreak, nextRewardCoins, nextResetAt }`
  - `POST /daily-rewards/claim` → `{ awardedCoins, currentStreak, newBalance: { coins, gems } }`
- `DailyRewardsService`
  - `getStatus(userId)` — reads the per-user doc, computes today vs `lastClaimedDay`.
  - `claim(userId, parentSession?)` — atomic: validate window, compute next streak (reset/increment/wrap), credit coins via `WalletService.credit({ reason: 'daily_reward', idempotencyKey: \`${userId}:${YYYY-MM-DD}\` })`, write `lastClaimedDay` + `currentStreak` in the same transaction.
- Mongoose schema `UserDailyReward`:
  - `userId: ObjectId` — unique index.
  - `lastClaimedDay: string` — `YYYY-MM-DD` UTC.
  - `currentStreak: number` — 0..7.

### Economy keys

Register 7 new keys in `economy-keys.ts`. Defaults are tuned so the week sums to a meaningful but not game-breaking total:

| Key | Default | Env override |
|---|---|---|
| `daily_reward_day_1` | 10 | `DAILY_REWARD_DAY_1` |
| `daily_reward_day_2` | 20 | `DAILY_REWARD_DAY_2` |
| `daily_reward_day_3` | 35 | `DAILY_REWARD_DAY_3` |
| `daily_reward_day_4` | 55 | `DAILY_REWARD_DAY_4` |
| `daily_reward_day_5` | 80 | `DAILY_REWARD_DAY_5` |
| `daily_reward_day_6` | 110 | `DAILY_REWARD_DAY_6` |
| `daily_reward_day_7` | 150 | `DAILY_REWARD_DAY_7` |

Sum = 460 coins / week. Adjustable at any time from the admin economy page.

### Frontend

New feature module `apps/web/src/features/daily-rewards/`:

- `server/daily-rewards.server.ts` — `getDailyRewardStatus()` Server Component fetch.
- `server/daily-rewards.actions.ts` — `claimDailyRewardAction` Server Action; `revalidatePath('/wallet')` + `revalidatePath('/')` on success.
- `ui/DailyRewardCard.tsx` — Server Component that fetches status + renders 7-stamp grid and the `ClaimButton` client island.
- `ui/ClaimButton.tsx` — Client Component, calls the Server Action, surfaces toast on success/error.
- i18n: new namespace `pages.dailyRewards` across en/ru/es/fr/by.

### Surfaces

- **Wallet page** (`/wallet`): full `DailyRewardCard` near the top.
- **Home page** (`/`): compact variant — single coin-glyph + "Claim X coins" CTA when available, hidden when already claimed.

## Data flow

1. User opens `/wallet` (Server Component).
2. `getDailyRewardStatus()` calls BE `GET /daily-rewards/me` and renders the card with current state.
3. User clicks Claim → `claimDailyRewardAction` (Server Action) → BE `POST /daily-rewards/claim`.
4. BE service runs inside a Mongo transaction: re-reads doc inside the session, validates `canClaim`, resolves the right `daily_reward_day_N` value via `EconomySettingsService`, credits the wallet, persists the new `lastClaimedDay` + `currentStreak`.
5. On success, the Server Action revalidates `/wallet` and `/` so server-rendered surfaces refresh, and the existing `WalletLiveBridge` socket pushes the new balance to the header.

## Concurrency / idempotency

- Double-click protection: BE rejects if `lastClaimedDay === today` (UTC).
- Wallet credit idempotency key: `${userId}:${YYYY-MM-DD}` — guarantees that even if the request is retried, the user gets credited once per day.
- Cross-module transaction: `claim` accepts an optional `parentSession?: ClientSession` and passes it down to `WalletService.credit`, matching the pattern used by referrals and game-win payout.

## Error handling

- Already claimed today → 409 with i18n key `dailyRewards.errors.alreadyClaimed`.
- Wallet credit failure (transaction abort) → 500 with generic retry message; nothing persisted.
- BE unreachable from Server Component → card renders as "unavailable" without breaking the page (same pattern as `BalanceChip`).

## Testing

- **BE unit (Jest)**: streak math — reset after gap, increment, wraparound at day 7, double-claim rejection, idempotency.
- **BE integration**: full claim flow against `mongodb-memory-server` replica set — ledger entry written + balance bumped + per-user doc updated.
- **Web unit (Vitest)**: `DailyRewardCard` renders the correct stamp state for each `currentStreak`; `ClaimButton` disables after click; toast fires on success.
- **E2E (Playwright)**: scaffolded `test.skip` placeholder for the claim flow on `/wallet` (live wallet not run in CI).

## Open questions

None — all the deferrable decisions (display surfaces, currency, streak vs flat, storage shape) are captured above.
