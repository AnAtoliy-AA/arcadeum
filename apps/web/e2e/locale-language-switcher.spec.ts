/**
 * E2E coverage for the header language switcher. Asserts that
 * `setLocale` swaps BOTH the locale prefix AND the localized top-level
 * slug — the behaviour landed in ARC-706's translated-slug map.
 */
import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';

/** Wait for React hydration so setLocaleRef is populated (not the noop). */
async function waitForHydration(page: import('@playwright/test').Page) {
  await page.waitForFunction(
    () => document.documentElement.getAttribute('data-app-ready') === 'true',
    { timeout: 15000 },
  );
}

async function waitForLangButton(
  page: import('@playwright/test').Page,
  testId: string,
): Promise<boolean> {
  const btn = page.getByTestId(testId).first();
  try {
    await expect(btn).toBeVisible({ timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

test.describe('Language switcher — URL swaps locale + slug', () => {
  test('switching EN → FR on /en/settings lands on /fr/parametres', async ({
    page,
  }) => {
    await page.goto('/en/settings', { waitUntil: 'domcontentloaded' });
    await waitForHydration(page);

    if (!(await waitForLangButton(page, 'lang-btn-fr'))) {
      test.skip(true, 'Inline language switcher not visible at this viewport.');
    }

    await page.getByTestId('lang-btn-fr').first().click();
    await page.waitForURL(/\/fr\/parametres/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('switching EN → RU on /en/games lands on /ru/igry', async ({ page }) => {
    await page.goto('/en/games', { waitUntil: 'domcontentloaded' });
    await waitForHydration(page);

    if (!(await waitForLangButton(page, 'lang-btn-ru'))) {
      test.skip(true, 'Inline language switcher not visible at this viewport.');
    }

    await page.getByTestId('lang-btn-ru').first().click();
    await page.waitForURL(/\/ru\/igry/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  });

  test('language preference persists across page navigations', async ({
    page,
  }) => {
    await page.goto('/en/settings', { waitUntil: 'domcontentloaded' });
    await waitForHydration(page);

    if (!(await waitForLangButton(page, 'lang-btn-es'))) {
      test.skip(true, 'Inline language switcher not visible at this viewport.');
    }

    await page.getByTestId('lang-btn-es').first().click();
    await page.waitForURL(/\/es\/ajustes/);

    // The switcher writes an app-language cookie that the proxy reads.
    // Wait for it to land so the subsequent navigation can't race it.
    await page.waitForFunction(() =>
      document.cookie.includes('app-language=es'),
    );

    // Navigate to /games (no prefix) — the cookie set by the switcher
    // should steer proxy to /es/juegos.
    await page.goto('/games', { waitUntil: 'commit' });
    await page.waitForURL(/\/es\/juegos/);
  });
});
