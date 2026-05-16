# Daily Playing Rewards — Implementation Plan (ARC-621)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reward users with coins once per UTC day via a manual "Claim" action, with a 7-day escalating streak that resets on miss; rewards are admin-tunable via the existing economy settings.

**Architecture:** New `DailyRewardsModule` on NestJS BE persists per-user `lastClaimedDay` + `currentStreak` in a dedicated Mongo collection, credits coins through the existing `WalletService.credit` (idempotency-keyed by `${userId}:${YYYY-MM-DD}`), and reads day-N coin values from `EconomySettingsService`. Web app surfaces a `DailyRewardCard` on the wallet page (and compact variant on home) using a Server Component + Server Action, refreshing the header balance via the existing `WalletLiveBridge` socket.

**Tech Stack:** NestJS, Mongoose (transactions), class-validator, Vitest (web), Jest (BE+integration), Playwright (e2e), Next.js Server Components/Actions, Tamagui via @arcadeum/ui.

**Spec:** `docs/superpowers/specs/2026-05-11-daily-playing-rewards-design.md`.

---

## Phase 1 — BE: register economy keys

### Task 1: Register `daily_reward_day_1` … `daily_reward_day_7`

**Files:**
- Modify: `apps/be/src/economy/economy-keys.ts`
- Modify: `apps/be/src/economy/economy-settings.integration-spec.ts` (length assertions)

- [ ] **Step 1:** Add the 7 entries to `ECONOMY_KEYS_CONFIG` (defaults 10/20/35/55/80/110/150, env names `DAILY_REWARD_DAY_1`…`_7`).
- [ ] **Step 2:** Update `apps/web/src/features/admin-economy/server/economy.types.ts` `EconomyKey` union and the 6→13 references in the admin-economy unit + integration tests.
- [ ] **Step 3:** Add i18n entries `keys.daily_reward_day_*` to all 5 admin-economy locale files.
- [ ] **Step 4:** Run `pnpm --filter be test -- economy-keys` and `pnpm --filter web test -- admin-economy` — all green.
- [ ] **Step 5:** Commit `feat(economy): register daily_reward_day_1..7 keys (ARC-621)`.

---

## Phase 2 — BE: DailyRewards module

### Task 2: Mongoose schema

**Files:**
- Create: `apps/be/src/daily-rewards/schemas/user-daily-reward.schema.ts`

```ts
@Schema({ collection: 'user_daily_rewards', timestamps: true })
export class UserDailyReward {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, required: true }) // YYYY-MM-DD UTC
  lastClaimedDay!: string;

  @Prop({ type: Number, required: true, min: 0, max: 7 })
  currentStreak!: number;
}
```

- [ ] Write the schema + class.
- [ ] Commit `feat(daily-rewards): add UserDailyReward schema (ARC-621)`.

### Task 3: Pure streak math

**Files:**
- Create: `apps/be/src/daily-rewards/streak.ts`
- Create: `apps/be/src/daily-rewards/streak.spec.ts`

```ts
export function todayUtc(now: Date): string; // 'YYYY-MM-DD'
export function isYesterday(prev: string, today: string): boolean;
export function nextStreak(prevStreak: number, prevDay: string | null, today: string): number;
//   - null prev → 1
//   - prev === today → throw (handled by caller; util is for "can claim" path)
//   - isYesterday(prev, today) → (prevStreak % 7) + 1
//   - else → 1
export function rewardKeyForStreak(streak: number): EconomyKey; // `daily_reward_day_${streak}`
```

- [ ] **Step 1:** Write failing unit tests covering: first claim, consecutive day, gap-day, Day-7 → Day-1 wrap, invalid streak input.
- [ ] **Step 2:** Implement.
- [ ] **Step 3:** `pnpm --filter be test -- streak` green.
- [ ] **Step 4:** Commit `feat(daily-rewards): pure streak math util (ARC-621)`.

### Task 4: Service

**Files:**
- Create: `apps/be/src/daily-rewards/daily-rewards.service.ts`
- Create: `apps/be/src/daily-rewards/daily-rewards.service.spec.ts`

Public API:

```ts
class DailyRewardsService {
  getStatus(userId: string): Promise<DailyRewardStatus>;
  claim(userId: string, parentSession?: ClientSession): Promise<DailyRewardClaimResult>;
}
```

Behavior:
- `getStatus` reads/creates per-user doc (lazy upsert returns null doc), resolves the next reward via `EconomySettingsService.resolveValue('daily_reward_day_${nextStreak}')`, computes `canClaim = lastClaimedDay !== today`.
- `claim` runs in a Mongo transaction (or joins `parentSession`): re-reads the doc inside the session, re-validates `canClaim`, picks streak via `nextStreak`, resolves the coin amount, calls `walletService.credit({ userId, coins, reason: 'daily_reward', idempotencyKey: \`${userId}:${today}\`, parentSession: session })`, then sets `lastClaimedDay = today, currentStreak = newStreak` and saves.

- [ ] **Step 1:** Write failing unit tests using `mongodb-memory-server` (single-node — service must handle no-transaction case for non-replica-set test envs; in prod replica set is assumed). Cover: first claim awards Day 1; consecutive day awards correct day; gap-day resets to Day 1; double claim same day throws `DailyRewardAlreadyClaimedError`; wallet failure rolls back the per-user doc.
- [ ] **Step 2:** Implement.
- [ ] **Step 3:** All service tests green.
- [ ] **Step 4:** Commit `feat(daily-rewards): service with streak + idempotent wallet credit (ARC-621)`.

### Task 5: Controller + DTOs + module

**Files:**
- Create: `apps/be/src/daily-rewards/daily-rewards.controller.ts`
- Create: `apps/be/src/daily-rewards/daily-rewards.module.ts`
- Create: `apps/be/src/daily-rewards/daily-rewards.controller.spec.ts`
- Modify: `apps/be/src/app.module.ts` (wire DailyRewardsModule)

Routes (`@UseGuards(JwtAuthGuard)` on both):
- `GET /daily-rewards/me` → service `getStatus`.
- `POST /daily-rewards/claim` → service `claim`. 409 on already-claimed (`AlreadyClaimedError` → `ConflictException`).

- [ ] **Step 1:** Write failing controller tests: success path, 409 on already-claimed, 401 without token.
- [ ] **Step 2:** Implement controller + module wiring.
- [ ] **Step 3:** Tests green.
- [ ] **Step 4:** Commit `feat(daily-rewards): GET /me + POST /claim endpoints (ARC-621)`.

### Task 6: Integration test (full claim flow)

**Files:**
- Create: `apps/be/src/daily-rewards/daily-rewards.integration-spec.ts`

- [ ] **Step 1:** Spin up `mongodb-memory-server` replica set + real `WalletModule` + `EconomyModule`. Test: claim → wallet ledger has `daily_reward` entry with correct amount; user `coins` bumped by Day 1 reward; per-user doc has `lastClaimedDay=today`, `currentStreak=1`. Second claim same day → 409.
- [ ] **Step 2:** `pnpm --filter be test -- daily-rewards.integration-spec` green.
- [ ] **Step 3:** Commit `test(daily-rewards): integration flow on real Mongo + wallet (ARC-621)`.

---

## Phase 3 — Web: feature module

### Task 7: Server fetch + types

**Files:**
- Create: `apps/web/src/features/daily-rewards/server/daily-rewards.types.ts`
- Create: `apps/web/src/features/daily-rewards/server/daily-rewards.server.ts`

Types match BE responses exactly. Wrap fetch failures the same way `BalanceChip` does (return null on error → caller renders fallback).

- [ ] Implement + commit `feat(daily-rewards/web): server fetch for /daily-rewards/me (ARC-621)`.

### Task 8: Server Action

**Files:**
- Create: `apps/web/src/features/daily-rewards/server/daily-rewards.actions.ts`
- Create: `apps/web/src/features/daily-rewards/server/daily-rewards.actions.test.ts`

```ts
'use server';
export async function claimDailyRewardAction(): Promise<
  { ok: true; result: ClaimResult } | { ok: false; code: 'already_claimed' | 'unauthorized' | 'unknown' }
>;
```

On `ok: true`, call `revalidatePath('/wallet')` and `revalidatePath('/')`.

- [ ] **Step 1:** Write failing test mocking `fetch` for success / 409 / 401 / network error.
- [ ] **Step 2:** Implement.
- [ ] **Step 3:** Tests green.
- [ ] **Step 4:** Commit `feat(daily-rewards/web): claim Server Action (ARC-621)`.

### Task 9: UI — DailyRewardCard + ClaimButton

**Files:**
- Create: `apps/web/src/features/daily-rewards/ui/DailyRewardCard.tsx` (Server Component)
- Create: `apps/web/src/features/daily-rewards/ui/StampRow.tsx`
- Create: `apps/web/src/features/daily-rewards/ui/ClaimButton.tsx` (`'use client'`)
- Create: `apps/web/src/features/daily-rewards/ui/DailyRewardCard.test.tsx`
- Create: `apps/web/src/features/daily-rewards/ui/ClaimButton.test.tsx`

- [ ] **Step 1:** Run `/check-ui-components` mentally: reuse `GlassCard`, `Typography`, `Button` from `@arcadeum/ui`. Stamps are inline divs (the project's existing pattern in admin-economy).
- [ ] **Step 2:** Write failing render tests: card renders 7 stamps with correct active/claimed/locked states for streaks 0..7; ClaimButton disabled when `!canClaim`; toast fires on success.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Tests green.
- [ ] **Step 5:** Commit `feat(daily-rewards/web): DailyRewardCard + ClaimButton (ARC-621)`.

### Task 10: i18n

**Files:**
- Create: `apps/web/src/shared/i18n/messages/pages/daily-rewards/{en,ru,es,fr,by}.ts`
- Modify: `apps/web/src/shared/i18n/messages/pages/{en,ru,es,fr,by}.ts` (register namespace `dailyRewards`)

Keys: `title`, `subtitle`, `claim`, `claimed`, `nextResetIn`, `streakLabel`, `dayLabel`, `errors.{alreadyClaimed,unauthorized,generic}`, `toasts.{claimed}`.

- [ ] Add EN first, mirror to RU/ES/FR/BY.
- [ ] Commit `feat(daily-rewards/i18n): translations across 5 locales (ARC-621)`.

### Task 11: Wire into /wallet page

**Files:**
- Modify: `apps/web/src/app/wallet/page.tsx` (insert `<DailyRewardCard />` near top)

- [ ] Add the card; ensure ordering doesn't break existing wallet layout.
- [ ] Smoke-test `/wallet` renders.
- [ ] Commit `feat(daily-rewards/web): mount DailyRewardCard on /wallet (ARC-621)`.

### Task 12: Compact variant on home

**Files:**
- Create: `apps/web/src/features/daily-rewards/ui/DailyRewardChip.tsx` (compact home CTA)
- Modify: `apps/web/src/app/page.tsx` (or its View component — find appropriate slot)

- [ ] Compact variant: shows only when `canClaim`; single coin-glyph + "Claim {n} coins" button; otherwise renders nothing.
- [ ] Smoke-test home.
- [ ] Commit `feat(daily-rewards/web): compact chip on home page (ARC-621)`.

---

## Phase 4 — E2E + finalize

### Task 13: E2E placeholder

**Files:**
- Create: `apps/web/e2e/daily-rewards/daily-rewards.spec.ts`

- [ ] `test.skip` placeholder following the `wallet-page.spec.ts` pattern: log in as test admin → visit `/wallet` → assert `DailyRewardCard` visible → click claim → assert toast + balance bump. (Skipped until live wallet/auth fixtures are wired into CI.)
- [ ] Commit `test(daily-rewards/e2e): scaffold spec (ARC-621)`.

### Task 14: PR

- [ ] `pnpm exec tsc --noEmit` (web + be) — clean.
- [ ] `pnpm test` (root) — green.
- [ ] Push branch.
- [ ] `gh pr create` with summary + test plan (mention dependency: needs `develop` to include ARC-619 ✓ already merged).

---

## Out of scope (deferred to follow-ups)

- Push notifications for daily reset.
- Reward gem fragments at Day 7.
- Multi-week "perfect month" mega-streak.
- Mobile app surface — this ticket is web-only; mobile gets its own ticket once the BE is stable.
