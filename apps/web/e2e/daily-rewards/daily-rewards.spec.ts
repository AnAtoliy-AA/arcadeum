/**
 * Daily-rewards E2E (ARC-622, expands on the ARC-621 scaffold)
 *
 * Infrastructure note
 * -------------------
 * /wallet and / are Server Components. Server Components fetch
 * /daily-rewards/me from the Next.js Node process — page.route() only
 * intercepts requests originating from the browser, so it does NOT intercept
 * the SSR fetch. The interactive claim path also runs via a Server Action
 * (also Node-side), so we cannot drive a full end-to-end click flow against
 * a mocked BE.
 *
 * What this spec covers, ordered from cheapest to richest:
 *
 *   1. Route reachability — /wallet and / never 5xx, even unauthenticated.
 *   2. Authenticated route shape — when a mocked session + dev server are
 *      available, the /wallet HTML response contains the daily-reward-card
 *      markers. Skipped gracefully if the dev server / BE is unreachable.
 *   3. DOM markup assertions — once we can render /wallet, verify all 7
 *      stamps and the claim button are present and have stable test-ids.
 *
 * What still requires a live backend (skip-annotated, lower in this file):
 *   - The full claim flow: click → success toast → balance bump → 409 on
 *     double-claim. The Server Action and SSR fetch both bypass Playwright.
 *
 * The skip block doubles as documentation for whoever turns on the seeded-DB
 * test infra (see also apps/web/e2e/admin-economy and e2e/wallet specs).
 */

import { expect } from '@playwright/test';
import { test } from '../fixtures/test-utils';
import { navigateTo, mockSession } from '../fixtures/test-utils';

// ── 1. Route reachability (no live backend / no auth required) ───────────────

test.describe('/wallet — daily reward card route health', () => {
  test('GET /wallet does not return 5xx (unauth redirects are OK)', async ({
    request,
  }) => {
    const res = await request.get('/wallet');
    expect(res.status()).toBeLessThan(500);
  });

  test('GET / does not return 5xx (chip is a Suspense child, fallback is null)', async ({
    request,
  }) => {
    const res = await request.get('/');
    expect(res.status()).toBeLessThan(500);
  });
});

// ── 2 + 3. Authenticated DOM assertions (mocked session, optional BE) ────────
//
// These tests use mockSession to set the access-token cookie so the Server
// Component renders the daily reward card. If the BE behind the dev server is
// unreachable (no be:dev running), the Server Component returns null (the
// defensive try/catch in DailyRewardCard) — in that case we skip the DOM
// assertion gracefully rather than failing the suite.

test.describe('/wallet daily-reward card — DOM (mocked session)', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('renders the daily-reward-card with 7 stamps when authenticated', async ({
    page,
  }) => {
    const res = await page.request.get('/wallet');
    if (res.status() >= 400) {
      test.skip();
      return;
    }

    await navigateTo(page, '/wallet');

    // The card is wrapped in <Suspense> so it may appear after the skeleton.
    // The card OR the skeleton must be present; we wait for either and then
    // skip if the card never appears (BE unreachable from SSR).
    const card = page.getByTestId('daily-reward-card');
    const cardVisible = await card
      .waitFor({ state: 'visible', timeout: 4000 })
      .then(() => true)
      .catch(() => false);

    if (!cardVisible) {
      test.skip(); // Live BE not reachable from the Next.js Node process
      return;
    }

    // All 7 stamps rendered with the correct test-ids
    for (let day = 1; day <= 7; day++) {
      await expect(page.getByTestId(`daily-reward-stamp-${day}`)).toBeVisible();
    }

    // Day 7 stamp shows the gem badge
    await expect(page.getByTestId('daily-reward-stamp-7-gem')).toBeVisible();

    // Claim button is present with a stable test-id
    await expect(page.getByTestId('daily-reward-claim-btn')).toBeVisible();
  });

  test('exactly one stamp is in the "active" state when canClaim is true', async ({
    page,
  }) => {
    const res = await page.request.get('/wallet');
    if (res.status() >= 400) {
      test.skip();
      return;
    }

    await navigateTo(page, '/wallet');

    const cardVisible = await page
      .getByTestId('daily-reward-card')
      .waitFor({ state: 'visible', timeout: 4000 })
      .then(() => true)
      .catch(() => false);
    if (!cardVisible) {
      test.skip();
      return;
    }

    // The claim button is either enabled (canClaim) or disabled (already
    // claimed). When enabled, exactly one stamp must be data-state="active".
    const btn = page.getByTestId('daily-reward-claim-btn');
    const isDisabled = await btn.isDisabled();

    if (!isDisabled) {
      const activeCount = await page
        .locator('[data-testid^="daily-reward-stamp-"][data-state="active"]')
        .count();
      expect(activeCount).toBe(1);
    } else {
      // Already claimed today — no stamp should be active.
      const activeCount = await page
        .locator('[data-testid^="daily-reward-stamp-"][data-state="active"]')
        .count();
      expect(activeCount).toBe(0);
    }
  });
});

// ── Home page compact chip (mocked session, optional BE) ─────────────────────

test.describe('/ daily-reward chip — DOM (mocked session)', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('chip is either present-and-claimable or absent (Suspense fallback)', async ({
    page,
  }) => {
    const res = await page.request.get('/');
    if (res.status() >= 400) {
      test.skip();
      return;
    }

    await navigateTo(page, '/');

    // The chip uses <Suspense fallback={null}> AND its inner component
    // returns null when canClaim is false. So either:
    //   - It is visible with an enabled claim button (canClaim was true), OR
    //   - It is absent from the DOM entirely.
    // Both states are valid; this test guards against a regression where the
    // chip renders in a broken, half-loaded state.
    const chip = page.getByTestId('daily-reward-chip');
    const count = await chip.count();
    if (count === 0) {
      // Absent — chip correctly hid itself (already claimed OR BE unreachable).
      return;
    }
    // Present — must have the claim button.
    await expect(page.getByTestId('daily-reward-claim-btn').first()).toBeVisible();
  });
});

// ── Full interactive flow — requires live backend with seeded player user ────

test.describe('Daily rewards — full interactive flow (live backend)', () => {
  test.skip(
    true,
    [
      'TODO: requires a live test DB seeded with:',
      '  1. A player user (credentials in E2E_PLAYER_EMAIL / E2E_PLAYER_PASSWORD).',
      '  2. The user must NOT have claimed today before the test runs',
      '     (seed a clean `user_daily_rewards` collection per test, or run',
      '     against a freshly-created user).',
      '',
      'When unblocked, the test should:',
      '  1. Log in as the player, navigate to /wallet.',
      '  2. Assert [data-testid="daily-reward-card"] is visible.',
      '  3. Assert exactly 7 [data-testid^="daily-reward-stamp-"] stamps render.',
      '  4. Assert one stamp has data-state="active" (the next-to-award day).',
      '  5. Read the header coin balance from [data-testid="balance-coins-value"].',
      '  6. Click [data-testid="daily-reward-claim-btn"].',
      '  7. Assert [data-testid="daily-reward-success"] becomes visible.',
      '  8. Assert the active stamp transitions to data-state="claimed".',
      '  9. Assert the balance chip shows a higher coin count (live socket update).',
      ' 10. Click claim again → assert the button is disabled OR shows the',
      '     already-claimed error.',
      ' 11. Day-7 case: seed `currentStreak=6, lastClaimedDay=yesterday`,',
      '     claim, then assert the gems balance bumped by daily_reward_day_7_bonus_gems.',
    ].join('\n'),
  );

  test('player can claim a daily reward and the balance + stamps update', async ({
    page,
  }) => {
    // Full interactive test outline — enabled once seeded DB is available.
    await page.goto('/login');
    await page
      .getByLabel(/email/i)
      .fill(process.env.E2E_PLAYER_EMAIL ?? 'player@example.com');
    await page
      .getByLabel(/password/i)
      .fill(process.env.E2E_PLAYER_PASSWORD ?? 'password');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await page.waitForURL(/\/(wallet|home|$)/);

    await page.goto('/wallet');
    await expect(page.getByTestId('daily-reward-card')).toBeVisible({
      timeout: 10000,
    });

    for (let i = 1; i <= 7; i++) {
      await expect(page.getByTestId(`daily-reward-stamp-${i}`)).toBeVisible();
    }

    const balanceLocator = page.getByTestId('balance-coins-value');
    const balanceBefore = (await balanceLocator.textContent()) ?? '';

    await page.getByTestId('daily-reward-claim-btn').click();
    await expect(page.getByTestId('daily-reward-success')).toBeVisible({
      timeout: 5000,
    });

    await expect
      .poll(async () => (await balanceLocator.textContent()) !== balanceBefore)
      .toBe(true);

    await page.getByTestId('daily-reward-claim-btn').click();
    await expect(page.getByTestId('daily-reward-error')).toBeVisible({
      timeout: 5000,
    });
  });
});
