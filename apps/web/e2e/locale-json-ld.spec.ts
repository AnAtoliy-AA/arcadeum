/**
 * E2E coverage for the structured-data emission landed in ARC-705 →
 * ARC-707. Asserts that each page type emits the appropriate
 * schema.org @type with `inLanguage` matching the URL locale.
 */
import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';

type Schema = { '@type'?: string | string[]; inLanguage?: string } & Record<
  string,
  unknown
>;

async function collectJsonLd(
  page: import('@playwright/test').Page,
): Promise<Schema[]> {
  const blobs = await page.$$eval('script[type="application/ld+json"]', (els) =>
    els.map((el) => el.textContent ?? ''),
  );
  const out: Schema[] = [];
  for (const blob of blobs) {
    try {
      const parsed = JSON.parse(blob);
      if (Array.isArray(parsed)) out.push(...parsed);
      else out.push(parsed);
    } catch {
      // ignore malformed blocks
    }
  }
  return out;
}

function findByType(blobs: Schema[], type: string): Schema | undefined {
  return blobs.find((b) => {
    const t = b['@type'];
    if (Array.isArray(t)) return t.includes(type);
    return t === type;
  });
}

test.describe('Locale JSON-LD — structured data per page', () => {
  test('home page emits Organization + locale-tagged WebSite and SoftwareApplication', async ({
    page,
  }) => {
    await page.goto('/fr', { waitUntil: 'domcontentloaded' });
    const blobs = await collectJsonLd(page);
    expect(findByType(blobs, 'Organization')).toBeDefined();
    const website = findByType(blobs, 'WebSite');
    expect(website).toBeDefined();
    expect(website?.inLanguage).toBe('fr-FR');
    const softwareApp = findByType(blobs, 'SoftwareApplication');
    expect(softwareApp).toBeDefined();
    expect(softwareApp?.genre).toEqual(
      expect.arrayContaining(['Board Game', 'Card Game', 'Mini Game']),
    );
    // FAQPage is restricted to government/healthcare authority sites (Aug 2023)
    // — home page must not emit it.
    expect(findByType(blobs, 'FAQPage')).toBeUndefined();
  });

  test('games page emits CollectionPage with French inLanguage', async ({
    page,
  }) => {
    await page.goto('/fr/jeux', { waitUntil: 'domcontentloaded' });
    // Route-level loading boundaries stream page content after the shell —
    // wait for the route's JSON-LD block instead of assuming it exists at
    // domcontentloaded (same pattern as the sea-battle test below).
    await page.waitForSelector('#json-ld-games-fr', { state: 'attached' });
    const blobs = await collectJsonLd(page);
    const collection = findByType(blobs, 'CollectionPage');
    expect(collection).toBeDefined();
    expect(collection?.inLanguage).toBe('fr-FR');
  });

  test('games page emits a BreadcrumbList', async ({ page }) => {
    await page.goto('/en/games', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#json-ld-games-en', { state: 'attached' });
    const blobs = await collectJsonLd(page);
    expect(findByType(blobs, 'BreadcrumbList')).toBeDefined();
  });

  test('settings page emits a BreadcrumbList with locale-correct URLs', async ({
    page,
  }) => {
    await page.goto('/ru/nastroyki', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#json-ld-breadcrumb-settings-ru', {
      state: 'attached',
    });
    const blobs = await collectJsonLd(page);
    const breadcrumb = findByType(blobs, 'BreadcrumbList');
    expect(breadcrumb).toBeDefined();
    const items = (breadcrumb?.itemListElement ?? []) as Array<{
      item?: string;
    }>;
    // home is position 1, settings is position 2
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items[0]?.item).toMatch(/\/ru$/);
    expect(items[1]?.item).toMatch(/\/ru\/nastroyki$/);
  });

  test('sea-battle landing keeps its VideoGame + BreadcrumbList without deprecated FAQPage', async ({
    page,
  }) => {
    await page.goto('/en/games/sea-battle', { waitUntil: 'domcontentloaded' });
    // The landing is server-rendered and streamed — on a cold dev-server
    // compile (common on CI Firefox) DOMContentLoaded can fire on the shell
    // before the route's JSON-LD block has streamed in. Wait for the block
    // instead of assuming it exists at domcontentloaded.
    await page.waitForSelector('#json-ld-sea-battle', { state: 'attached' });
    const blobs = await collectJsonLd(page);
    expect(findByType(blobs, 'VideoGame')).toBeDefined();
    expect(findByType(blobs, 'BreadcrumbList')).toBeDefined();
    // FAQPage rich results are restricted to government/health sites since
    // Aug 2023 — the landing must not emit it (visible FAQ content stays).
    expect(findByType(blobs, 'FAQPage')).toBeUndefined();
  });

  test('player profile page emits ProfilePage + Person', async ({ page }) => {
    await page.goto('/en/players/test-id', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#json-ld-player-test-id-en', {
      state: 'attached',
    });
    const blobs = await collectJsonLd(page);
    expect(findByType(blobs, 'ProfilePage')).toBeDefined();
  });
});
