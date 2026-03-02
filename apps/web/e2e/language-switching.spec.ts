import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Language Switching', () => {
  test('should change language and persist across pages', async ({ page }) => {
    // 1. Start at Home Page in English
    await navigateTo(page, '/');
    await expect(
      page.getByRole('link', { name: /games/i }).first(),
    ).toBeVisible();

    // 2. Go to Settings and change to Russian
    await navigateTo(page, '/settings');
    // Verify English is selected
    await expect(page.getByTestId('lang-btn-en')).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    // Switch to Russian using the page button
    await page.getByTestId('lang-btn-ru').click();

    // Verify page content changed to Russian using polling for stability
    await expect(async () => {
      const settingsTitle = page.getByRole('heading', { level: 1 });
      const text = await settingsTitle.innerText();
      if (!/настройки/i.test(text)) {
        throw new Error(`Not yet Russian. Current text: "${text}"`);
      }
    }).toPass({ timeout: 15000 });

    // 4. Navigate back to Home and verify it is translated
    await navigateTo(page, '/');

    // Check for "Games" link translation in Russian (likely "Игры" or similar)
    // Based on settings.ts, ru translation for title is "Настройки"
    await expect(
      page.getByRole('link', { name: /games/i }).first(),
    ).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('link', { name: /игры/i }).first()).toBeVisible(
      { timeout: 10000 },
    );

    // 5. Reload page and verify language persists
    await page.reload();
    // Wait for hydration after reload
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme-preference',
      /.+/,
      { timeout: 10000 },
    );

    await expect(page.getByRole('link', { name: /игры/i }).first()).toBeVisible(
      { timeout: 10000 },
    );

    // 6. Change back to English
    await navigateTo(page, '/settings');
    await page.getByTestId('lang-btn-en').click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /settings/i,
      { timeout: 10000 },
    );
  });
});
