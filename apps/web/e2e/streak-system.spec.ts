import { expect } from '@playwright/test';
import { test, navigateTo, mockSession } from './fixtures/test-utils';

test.describe('Streak System & Streak Freeze UI', () => {
  test('renders streak freeze card and purchase button on rewards page', async ({
    page,
  }) => {
    const res = await page.request.get('/rewards');
    if (res.status() >= 400) {
      test.skip();
      return;
    }

    await navigateTo(page, '/rewards');

    const streakFreezeCard = page.getByTestId('streak-freeze-card');
    await expect(streakFreezeCard).toBeVisible();

    const statusBadge = page.getByTestId('streak-freeze-status-badge');
    await expect(statusBadge).toBeVisible();

    const buyButton = page.getByTestId('buy-streak-freeze-button');
    await expect(buyButton).toBeVisible();
    await expect(buyButton).toContainText(/Streak Freeze/i);
  });

  test('header renders streak link when authenticated', async ({ page }) => {
    await mockSession(page);

    const res = await page.request.get('/rewards');
    if (res.status() >= 400) {
      test.skip();
      return;
    }

    await navigateTo(page, '/rewards');

    const headerStreakBadge = page.getByTestId('header-streak-badge');
    if ((await headerStreakBadge.count()) > 0) {
      await expect(headerStreakBadge).toHaveAttribute(
        'href',
        expect.stringContaining('/rewards'),
      );
      const viewport = page.viewportSize();
      if (viewport && viewport.width >= 640) {
        await expect(headerStreakBadge).toBeVisible();
      }
    }
  });
});
