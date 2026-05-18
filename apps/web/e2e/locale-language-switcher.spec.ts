/**
 * E2E coverage for the header language switcher. Asserts that
 * `setLocale` swaps BOTH the locale prefix AND the localized top-level
 * slug — the behaviour landed in ARC-706's translated-slug map.
 */
import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';

test.describe('Language switcher — URL swaps locale + slug', () => {
  test('switching EN → FR on /en/settings lands on /fr/parametres', async ({
    page,
  }) => {
    await page.goto('/en/settings', { waitUntil: 'domcontentloaded' });

    const frButton = page.getByTestId('lang-btn-fr');
    if (!(await frButton.isVisible())) {
      // Some layouts hide the inline language buttons on smaller breakpoints.
      // Skip rather than fail in those configurations.
      test.skip(true, 'Inline language switcher not visible at this viewport.');
    }

    await frButton.click();
    await page.waitForURL(/\/fr\/parametres\b/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/fr\/parametres\b/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('switching EN → RU on /en/games lands on /ru/igry', async ({
    page,
  }) => {
    await page.goto('/en/games', { waitUntil: 'domcontentloaded' });

    const ruButton = page.getByTestId('lang-btn-ru');
    if (!(await ruButton.isVisible())) {
      test.skip(true, 'Inline language switcher not visible at this viewport.');
    }

    await ruButton.click();
    await page.waitForURL(/\/ru\/igry\b/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/ru\/igry\b/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  });

  test('language preference persists across page navigations', async ({
    page,
  }) => {
    await page.goto('/en/settings', { waitUntil: 'domcontentloaded' });

    const esButton = page.getByTestId('lang-btn-es');
    if (!(await esButton.isVisible())) {
      test.skip(true, 'Inline language switcher not visible at this viewport.');
    }
    await esButton.click();
    await page.waitForURL(/\/es\/ajustes\b/, { timeout: 5000 });

    // Navigate to /games (no prefix) — the cookie set by the switcher
    // should steer middleware to /es/juegos.
    await page.goto('/games', { waitUntil: 'commit' });
    await expect(page).toHaveURL(/\/es\/juegos\b/);
  });
});
