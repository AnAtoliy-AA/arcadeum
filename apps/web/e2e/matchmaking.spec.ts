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

  test('should open matchmaking modal and support cancellation', async ({
    page,
  }) => {
    await navigateTo(page, routes.seaBattleLanding);

    const humanBtn = page.getByTestId('quickplay-human-button').first();
    await expect(humanBtn).toBeVisible();

    const modal = page.getByTestId('matchmaking-modal');
    await expect(async () => {
      await humanBtn.click();
      await expect(modal).toBeVisible();
    }).toPass();

    const timer = page.getByTestId('matchmaking-timer');
    await expect(timer).toBeVisible();

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

    const modal = page.getByTestId('matchmaking-modal');
    await expect(async () => {
      await humanBtn.scrollIntoViewIfNeeded();
      await humanBtn.click();
      await expect(modal).toBeVisible();
    }).toPass();

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
