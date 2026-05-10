/**
 * Task 19 — Admin economy page E2E scaffold (ARC-619)
 *
 * Infrastructure note
 * -------------------
 * The /admin/economy page is a Server Component gated by `requireAdmin()`, which
 * fetches /auth/me from the Next.js Node process. Playwright's `page.route()` only
 * intercepts browser-originated requests, so it cannot mock that server-side fetch.
 *
 * What we CAN test without a live backend:
 *   - SEO / robots invariants (no server needed).
 *   - That the route does not return a 5xx (regression guard).
 *
 * The full interactive flow (edit dialog, reset, history drawer) requires a live
 * backend with a seeded admin user and is captured in the skip-annotated block below.
 */

import { test, expect } from '@playwright/test';

// ── SEO / robots regression ───────────────────────────────────────────────────

test.describe('/admin/economy SEO regression', () => {
  test('robots.txt still disallows /admin/', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    expect(await res.text()).toMatch(/Disallow:\s*\/admin\//);
  });

  test('sitemap.xml does not include /admin/economy', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    expect(await res.text()).not.toMatch(/\/admin\/economy/);
  });
});

// ── Route reachability (mocked — no 5xx guard) ────────────────────────────────

test.describe('/admin/economy — route health', () => {
  test('GET /admin/economy does not return 5xx (unauthenticated redirects are OK)', async ({
    request,
  }) => {
    // Without auth the server redirects to login (3xx) or returns 401 — either is
    // acceptable. A 5xx would indicate a broken route registration or missing module.
    const res = await request.get('/admin/economy');
    expect(res.status()).toBeLessThan(500);
  });
});

// ── Full interactive flow — requires live backend with seeded admin user ───────

test.describe('Admin economy settings — full interactive flow (live backend)', () => {
  test.skip(
    true,
    [
      'TODO (ARC-619): requires a live test DB seeded with:',
      '  1. An admin user (credentials in E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD env vars)',
      '',
      'When unblocked, the test should:',
      '  1. Log in as admin, navigate to /admin/economy.',
      '  2. Assert [data-testid="economy-table"] is visible.',
      '  3. Assert all 6 economy keys appear as rows.',
      '  4. Click [data-testid="economy-edit-game_win_coin_reward"].',
      '  5. Assert [data-testid="economy-edit-dialog"] is visible.',
      '  6. Clear the input, type "100", click [data-testid="economy-save-btn"].',
      '  7. Assert [data-testid="economy-success-message"] is visible.',
      '  8. Assert [data-testid="economy-source-game_win_coin_reward"] contains "Admin override".',
      '  9. Click [data-testid="economy-reset-btn"] to reset back to default.',
      ' 10. Assert source badge reverts to "Environment" or "Code default".',
      ' 11. Click [data-testid="economy-history-game_win_coin_reward"].',
      ' 12. Assert [data-testid="economy-audit-list"] has at least 2 rows (set + reset).',
    ].join('\n'),
  );

  test('admin can set, reset, and view history of an economy key', async ({
    page,
  }) => {
    // Full interactive test outline — enabled once seeded DB is available.
    await page.goto('/login');
    await page
      .getByLabel(/email/i)
      .fill(process.env.E2E_ADMIN_EMAIL ?? 'admin@example.com');
    await page
      .getByLabel(/password/i)
      .fill(process.env.E2E_ADMIN_PASSWORD ?? 'password');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await page.waitForURL(/\/admin/);

    await page.goto('/admin/economy');
    await expect(page.getByTestId('economy-table')).toBeVisible({
      timeout: 10000,
    });

    // Edit game_win_coin_reward
    await page.getByTestId('economy-edit-game_win_coin_reward').click();
    await expect(page.getByTestId('economy-edit-dialog')).toBeVisible();

    const input = page.getByTestId('economy-value-input');
    await input.fill('100');
    await page.getByTestId('economy-save-btn').click();

    await expect(page.getByTestId('economy-success-message')).toBeVisible({
      timeout: 5000,
    });

    // Verify source badge changed
    await expect(
      page.getByTestId('economy-source-game_win_coin_reward'),
    ).toContainText('Admin override');

    // Reset to default
    await page.getByTestId('economy-edit-game_win_coin_reward').click();
    await page.getByTestId('economy-reset-btn').click();

    // View audit history
    await page.getByTestId('economy-history-game_win_coin_reward').click();
    await expect(page.getByTestId('economy-audit-list')).toBeVisible({
      timeout: 5000,
    });
    const rows = page.getByTestId(/^economy-audit-row-/);
    await expect(rows).toHaveCount(2, { timeout: 5000 });
  });
});
