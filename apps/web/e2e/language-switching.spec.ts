import { expect } from '@playwright/test';
import {
  test,
  ensureNavigationVisible,
  navigateTo,
} from './fixtures/test-utils';

test.describe('Language Switching', () => {
  test('should change language and persist across pages', async ({ page }) => {
    await navigateTo(page, '/');
    await ensureNavigationVisible(page);
    await expect(
      page.getByRole('link', { name: /rooms/i }).first(),
    ).toBeVisible();

    await navigateTo(page, '/settings');
    await expect(page.getByTestId('lang-btn-en').first()).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await page.getByTestId('lang-btn-ru').first().click();

    await expect(async () => {
      const settingsTitle = page.getByRole('heading', { level: 1 });
      const text = await settingsTitle.innerText();
      if (!/настройки/i.test(text)) {
        throw new Error(`Not yet Russian. Current text: "${text}"`);
      }
    }).toPass();

    await navigateTo(page, '/');

    await ensureNavigationVisible(page);
    await expect(
      page.getByRole('link', { name: /комнаты/i }).first(),
    ).toBeVisible();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');

    await ensureNavigationVisible(page);
    await expect(
      page.getByRole('link', { name: /комнаты/i }).first(),
    ).toBeVisible();

    await navigateTo(page, '/settings');
    await page.getByTestId('lang-btn-en').first().click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /settings/i,
    );
  });
});
