/**
 * Task 13 — Daily-rewards page E2E scaffold (ARC-621)
 *
 * Infrastructure note
 * -------------------
 * The /wallet page is a Server Component gated by `requireAuth()`, which
 * fetches /auth/me + /daily-rewards/me from the Next.js Node process.
 * Playwright's `page.route()` only intercepts browser-originated requests, so
 * it cannot mock those server-side fetches. The same constraint applies to
 * the compact home-page chip — both surfaces issue their daily-rewards fetch
 * from the SSR runtime.
 *
 * What we CAN test without a live backend:
 *   - Route reachability — that /wallet and / do not 5xx (regression guard).
 *
 * The full interactive flow (claim → toast → balance refresh → 409 on
 * double-claim) requires a live backend with a seeded player user and is
 * captured in the skip-annotated block below — same pattern as
 * `e2e/admin-economy/admin-economy.spec.ts` and `e2e/wallet/wallet-page.spec.ts`.
 */

import { test, expect } from '@playwright/test';

// ── Route reachability (no live backend required) ────────────────────────────

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

// ── Full interactive flow — requires live backend with seeded player user ────

test.describe('Daily rewards — full interactive flow (live backend)', () => {
  test.skip(
    true,
    [
      'TODO (ARC-621): requires a live test DB seeded with:',
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

    // 7 stamps render
    for (let i = 1; i <= 7; i++) {
      await expect(page.getByTestId(`daily-reward-stamp-${i}`)).toBeVisible();
    }

    // Read the current balance before claiming
    const balanceLocator = page.getByTestId('balance-coins-value');
    const balanceBefore = (await balanceLocator.textContent()) ?? '';

    // Claim
    await page.getByTestId('daily-reward-claim-btn').click();
    await expect(page.getByTestId('daily-reward-success')).toBeVisible({
      timeout: 5000,
    });

    // The header chip should reflect the new (higher) balance via the
    // WalletLiveBridge socket OR after the next SSR refresh.
    await expect
      .poll(async () => (await balanceLocator.textContent()) !== balanceBefore)
      .toBe(true);

    // Double claim is rejected
    await page.getByTestId('daily-reward-claim-btn').click();
    await expect(page.getByTestId('daily-reward-error')).toBeVisible({
      timeout: 5000,
    });
  });
});
