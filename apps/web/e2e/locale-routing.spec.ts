/**
 * E2E coverage for the locale routing infrastructure landed in ARC-702
 * → ARC-707. Covers:
 *
 * 1. Middleware locale-prefix redirect from unprefixed URLs
 * 2. Cookie-based locale detection
 * 3. Accept-Language-based locale detection (lower priority than cookie)
 * 4. Translated-slug redirects: /fr/games → /fr/jeux
 * 5. Localized URLs render successfully (200)
 * 6. `<html lang>` matches the URL locale
 */
import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';

test.describe('Locale routing — middleware redirects', () => {
  test('unprefixed `/` redirects to `/en` for a fresh cookie-less visitor', async ({
    page,
  }) => {
    await page.context().clearCookies();
    const response = await page.goto('/', { waitUntil: 'commit' });
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/en\/?$/);
  });

  test('unprefixed `/games` redirects to `/en/games` for a cookie-less visitor', async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto('/games', { waitUntil: 'commit' });
    await expect(page).toHaveURL(/\/en\/games\b/);
  });

  test('cookie locale steers the redirect (`app-language=fr` → `/fr/jeux`)', async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: 'app-language',
        value: 'fr',
        url: page.url() === 'about:blank' ? 'http://127.0.0.1' : page.url(),
        path: '/',
      },
    ]);
    await page.goto('/games', { waitUntil: 'commit' });
    // /games → /fr/games (cookie) → 308 → /fr/jeux (translated slug)
    await expect(page).toHaveURL(/\/fr\/jeux\b/);
  });

  test('Accept-Language steers the redirect when no cookie is set', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      locale: 'es-ES',
      extraHTTPHeaders: { 'Accept-Language': 'es-ES,es;q=0.9' },
    });
    const page = await context.newPage();
    await page.goto('/games', { waitUntil: 'commit' });
    await expect(page).toHaveURL(/\/es\/juegos\b/);
    await context.close();
  });

  test('English slug under non-English locale redirects to localized slug', async ({
    page,
  }) => {
    await page.goto('/fr/games', { waitUntil: 'commit' });
    await expect(page).toHaveURL(/\/fr\/jeux\b/);
  });

  test('English slug under Russian locale redirects (`/ru/settings` → `/ru/nastroyki`)', async ({
    page,
  }) => {
    await page.goto('/ru/settings', { waitUntil: 'commit' });
    await expect(page).toHaveURL(/\/ru\/nastroyki\b/);
  });

  test('localized URL renders directly without a redirect (`/fr/jeux`)', async ({
    page,
  }) => {
    await page.goto('/fr/jeux', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/fr\/jeux\b/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('localized URL with nested English path renders (`/es/juegos/create`)', async ({
    page,
  }) => {
    await page.goto('/es/juegos/create', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/es\/juegos\/create\b/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('Belarusian slug renders (`/by/hulni`)', async ({ page }) => {
    await page.goto('/by/hulni', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/by\/hulni\b/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'by');
  });
});
