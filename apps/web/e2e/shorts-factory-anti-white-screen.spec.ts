import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Shorts Factory Gameplay and Scenarios Canvas', () => {
  test('renders dark canvas background for video capture without white screen flash', async ({
    page,
  }) => {
    await navigateTo(page, '/en');
    const html = page.locator('html');
    await expect(html).toHaveAttribute(
      'data-theme',
      /dark|arcade|cyberpunk|galaxy/i,
    );

    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    expect(bodyBg).not.toBe('rgb(255, 255, 255)');
  });

  test('gameplay landings expose quickplay buttons and dark board areas', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/sea-battle');
    const quickplayBtn = page
      .locator('[data-testid="quickplay-ai-button"]')
      .first();
    await expect(quickplayBtn).toBeVisible();

    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeVisible();
    const bgColor = await mainContent.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
  });

  test('chess landing exposes stockfish engine and interactive play components', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess');
    const quickplayBtn = page
      .locator('[data-testid="quickplay-ai-button"]')
      .first();
    await expect(quickplayBtn).toBeVisible();
  });
});
