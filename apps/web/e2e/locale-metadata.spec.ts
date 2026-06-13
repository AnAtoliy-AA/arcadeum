/**
 * E2E coverage for the per-locale metadata landed in ARC-703 → ARC-706:
 * hreflang alternates, locale-correct canonical URLs, OG locale tags.
 */
import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';

interface LinkAttrs {
  hreflang: string | null;
  href: string | null;
}

async function collectAlternates(page: import('@playwright/test').Page) {
  return page.$$eval('link[rel="alternate"][hreflang]', (els): LinkAttrs[] =>
    els.map((el) => ({
      hreflang: el.getAttribute('hreflang'),
      href: el.getAttribute('href'),
    })),
  );
}

async function getCanonical(page: import('@playwright/test').Page) {
  return page.getAttribute('link[rel="canonical"]', 'href');
}

async function getMeta(
  page: import('@playwright/test').Page,
  property: string,
) {
  return page.getAttribute(`meta[property="${property}"]`, 'content');
}

test.describe('Locale metadata — hreflang & canonical', () => {
  test('home page emits hreflang for every locale + x-default', async ({
    page,
  }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    const alts = await collectAlternates(page);
    const hreflangs = alts.map((a) => a.hreflang);
    // Belarusian emits `hreflang="be"` (ISO 639-1) — our internal locale
    // slug is `by` (country code), but `by` is not a valid BCP 47 language
    // code so Google / Lighthouse flag it as unknown. See
    // shared/i18n/index.ts → localeToHreflang.
    expect(hreflangs).toEqual(
      expect.arrayContaining(['en', 'es', 'fr', 'ru', 'be', 'x-default']),
    );
  });

  test('home canonical points at the active locale root', async ({ page }) => {
    await page.goto('/fr', { waitUntil: 'domcontentloaded' });
    const canonical = await getCanonical(page);
    expect(canonical).toMatch(/\/fr$/);
  });

  test('games page canonical reflects the localized slug', async ({ page }) => {
    await page.goto('/fr/jeux', { waitUntil: 'domcontentloaded' });
    const canonical = await getCanonical(page);
    expect(canonical).toMatch(/\/fr\/jeux$/);
  });

  test('hreflang on /fr/jeux points each locale at its own slug', async ({
    page,
  }) => {
    await page.goto('/fr/jeux', { waitUntil: 'domcontentloaded' });
    const alts = await collectAlternates(page);
    const byLang = Object.fromEntries(alts.map((a) => [a.hreflang, a.href]));

    expect(byLang['en']).toMatch(/\/en\/games$/);
    expect(byLang['fr']).toMatch(/\/fr\/jeux$/);
    expect(byLang['es']).toMatch(/\/es\/juegos$/);
    expect(byLang['ru']).toMatch(/\/ru\/igry$/);
    // Belarusian: internal slug stays `by`, but hreflang must be `be`.
    expect(byLang['be']).toMatch(/\/by\/hulni$/);
  });

  test('og:locale matches the active locale (en → en_US)', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    const ogLocale = await getMeta(page, 'og:locale');
    expect(ogLocale).toBe('en_US');
  });

  test('og:locale matches the active locale (fr → fr_FR)', async ({ page }) => {
    await page.goto('/fr', { waitUntil: 'domcontentloaded' });
    const ogLocale = await getMeta(page, 'og:locale');
    expect(ogLocale).toBe('fr_FR');
  });

  test('og:locale:alternate covers the other supported locales', async ({
    page,
  }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    const alternates = await page.$$eval(
      'meta[property="og:locale:alternate"]',
      (els) => els.map((el) => el.getAttribute('content')),
    );
    expect(alternates).toEqual(
      expect.arrayContaining(['es_ES', 'fr_FR', 'ru_RU', 'be_BY']),
    );
  });
});
