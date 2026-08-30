import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

test.describe('Tier 2 Retention and Performance Suite', () => {
  test('validates core app shell and metrics endpoint', async ({ request }) => {
    const res = await request.get('/api/metrics');
    expect(res.ok()).toBeTruthy();
  });

  test('navigates to roadmap and verifies retention and performance tiers', async ({
    page,
  }) => {
    await navigateTo(page, routes.roadmap);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Arcadeum Games Roadmap/i }),
    ).toBeVisible();

    const tiersTab = page.getByRole('button', {
      name: /Strategic Tiers|Tiers|Стратегические уровни/i,
    });
    await expect(tiersTab).toBeVisible();
    await tiersTab.click();

    await expect(
      page.getByText(/Retention & Habit Loops/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/Performance & Latency/i).first(),
    ).toBeVisible();
    await expect(page.getByText('Implemented').first()).toBeVisible();
  });
});
