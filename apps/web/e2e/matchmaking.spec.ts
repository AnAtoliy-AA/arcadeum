import { expect } from '@playwright/test';
import {
  test,
  navigateTo,
  mockSession,
  mockAllOnPage,
} from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

test.describe('Matchmaking Queue', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllOnPage(page);
    await mockSession(page);
  });

  test('should open matchmaking modal, display players ahead, and support cancellation', async ({
    page,
  }) => {
    await navigateTo(page, routes.seaBattleLanding);

    const humanBtn = page.getByTestId('quickplay-human-button').first();
    await expect(humanBtn).toBeVisible();

    await page.waitForFunction(
      () =>
        typeof (window as Window & { __joinMatchmaking?: unknown })
          .__joinMatchmaking === 'function',
    );

    await page.evaluate(() =>
      (
        window as Window & { __joinMatchmaking?: (g: string) => Promise<void> }
      ).__joinMatchmaking?.('sea_battle_v1'),
    );

    const modal = page.getByTestId('matchmaking-modal');
    await expect(modal).toBeVisible();

    const timer = page.getByTestId('matchmaking-timer');
    await expect(timer).toBeVisible();

    const playersAheadBadge = page.getByTestId('matchmaking-players-ahead');
    await expect(playersAheadBadge).toBeVisible();

    const positionText = page.getByTestId('matchmaking-position');
    await expect(positionText).toBeVisible();

    const cancelBtn = page.getByTestId('matchmaking-cancel');
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    await expect(modal).not.toBeVisible();
  });

  test('should support minimizing to floating bar and expanding back', async ({
    page,
  }) => {
    await navigateTo(page, routes.seaBattleLanding);

    const humanBtn = page.getByTestId('quickplay-human-button').first();
    await expect(humanBtn).toBeVisible();

    await page.waitForFunction(
      () =>
        typeof (window as Window & { __joinMatchmaking?: unknown })
          .__joinMatchmaking === 'function',
    );

    await page.evaluate(() =>
      (
        window as Window & { __joinMatchmaking?: (g: string) => Promise<void> }
      ).__joinMatchmaking?.('sea_battle_v1'),
    );

    const modal = page.getByTestId('matchmaking-modal');
    await expect(modal).toBeVisible();

    const minimizeBtn = page.getByTestId('matchmaking-minimize');
    await expect(minimizeBtn).toBeVisible();
    await minimizeBtn.click();

    await expect(modal).not.toBeVisible();
    const floatingBar = page.getByTestId('matchmaking-floating-bar');
    await expect(floatingBar).toBeVisible();

    const expandBtn = page.getByTestId('matchmaking-expand');
    await expect(expandBtn).toBeVisible();
    await expandBtn.click();

    await expect(floatingBar).not.toBeVisible();
    await expect(modal).toBeVisible();

    const cancelBtn = page.getByTestId('matchmaking-cancel');
    await cancelBtn.click();
    await expect(modal).not.toBeVisible();
  });
});
