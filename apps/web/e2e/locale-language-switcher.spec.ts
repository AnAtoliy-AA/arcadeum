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

    const frButton = page.getByTestId('lang-btn-fr').first();
    if (!(await frButton.isVisible())) {
      // Some layouts hide the inline language buttons on smaller breakpoints.
      // Skip rather than fail in those configurations.
      test.skip(true, 'Inline language switcher not visible at this viewport.');
    }

    await frButton.click();
    await expect(page).toHaveURL(/\/fr\/parametres\b/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('switching EN → RU on /en/games lands on /ru/igry', async ({ page }) => {
    await page.goto('/en/games', { waitUntil: 'domcontentloaded' });

    const ruButton = page.getByTestId('lang-btn-ru').first();
    if (!(await ruButton.isVisible())) {
      test.skip(true, 'Inline language switcher not visible at this viewport.');
    }

    await ruButton.click();
    await expect(page).toHaveURL(/\/ru\/igry\b/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  });

  test('language preference persists across page navigations', async ({
    page,
  }) => {
    await page.goto('/en/settings', { waitUntil: 'domcontentloaded' });

    const esButton = page.getByTestId('lang-btn-es').first();
    if (!(await esButton.isVisible())) {
      test.skip(true, 'Inline language switcher not visible at this viewport.');
    }
    await esButton.click();
    await expect(page).toHaveURL(/\/es\/ajustes\b/);

    // The switcher writes an app-language cookie that the proxy reads.
    // Wait for it to land so the subsequent navigation can't race it.
    await page.waitForFunction(() =>
      document.cookie.includes('app-language=es'),
    );

    // Navigate to /games (no prefix) — the cookie set by the switcher
    // should steer proxy to /es/juegos.
    await page.goto('/games', { waitUntil: 'commit' });
    await expect(page).toHaveURL(/\/es\/juegos\b/);
  });
});
