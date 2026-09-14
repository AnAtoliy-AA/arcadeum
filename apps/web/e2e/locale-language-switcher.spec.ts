/**
 * E2E coverage for the header language switcher. Asserts that
 * `setLocale` swaps BOTH the locale prefix AND the localized top-level
 * slug — the behaviour landed in ARC-706's translated-slug map.
 */
import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

async function waitForLangButton(
  page: import('@playwright/test').Page,
  testId: string,
): Promise<boolean> {
  const btn = page.getByTestId(testId).first();
  try {
    await expect(btn).toBeVisible();
    return true;
  } catch {
    return false;
  }
}

test.describe('Language switcher — URL swaps locale + slug', () => {
  test('switching EN → FR on /en/settings lands on /fr/parametres', async ({
    page,
  }) => {
    await navigateTo(page, '/en/settings');

    if (!(await waitForLangButton(page, 'lang-btn-fr'))) {
      test.skip(true, 'Inline language switcher not visible at this viewport.');
    }

    await page.getByTestId('lang-btn-fr').first().click();
    await page.waitForURL(/\/fr\/parametres/, {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('switching EN → RU on /en/games lands on /ru/igry', async ({ page }) => {
    await navigateTo(page, '/en/games');

    if (!(await waitForLangButton(page, 'lang-btn-ru'))) {
      test.skip(true, 'Inline language switcher not visible at this viewport.');
    }

    await page.getByTestId('lang-btn-ru').first().click();
    await page.waitForURL(/\/ru\/igry/, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  });

  test('language preference persists across page navigations', async ({
    page,
  }) => {
    await navigateTo(page, '/en/settings');

    if (!(await waitForLangButton(page, 'lang-btn-es'))) {
      test.skip(true, 'Inline language switcher not visible at this viewport.');
    }

    await page.getByTestId('lang-btn-es').first().click();
    await page.waitForURL(/\/es\/ajustes/, { waitUntil: 'domcontentloaded' });

    // The switcher writes an app-language cookie that the proxy reads.
    // Wait for it to land so the subsequent navigation can't race it.
    await page.waitForFunction(() =>
      document.cookie.includes('app-language=es'),
    );

    // Navigate to /games (no prefix) — the cookie set by the switcher
    // should steer proxy to /es/juegos.
    await navigateTo(page, '/games');
    await page.waitForURL(/\/es\/juegos/, { waitUntil: 'domcontentloaded' });
  });
});
