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
    const russianBtn = page.getByRole('button', { name: /русский/i });
    await russianBtn.click();
    await expect(russianBtn).toHaveAttribute('aria-pressed', 'true');

    // 3. Verify Settings page translated
    await expect(page.locator('h1')).toContainText(/настройки/i);

    // 4. Navigate back to Home and verify it is translated
    await page.goto('/');
    // Check for "Games" link translation in Russian (likely "Игры" or similar)
    // Based on settings.ts, ru translation for title is "Настройки"
    // Let's check common.ts or just check that English text is NOT there
    await expect(
      page.getByRole('link', { name: /games/i }).first(),
    ).not.toBeVisible();
    await expect(
      page.getByRole('link', { name: /игры/i }).first(),
    ).toBeVisible();

    // 5. Reload page and verify language persists
    await page.reload();
    await expect(
      page.getByRole('link', { name: /игры/i }).first(),
    ).toBeVisible();

    // 6. Change back to English
    await navigateTo(page, '/settings');
    const englishBtn = page.getByRole('button', { name: /english/i });
    await englishBtn.click();
    await expect(page.locator('h1')).toContainText(/settings/i);
  });
});
