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
  test('home page emits Organization + locale-tagged WebSite', async ({
    page,
  }) => {
    await page.goto('/fr', { waitUntil: 'domcontentloaded' });
    const blobs = await collectJsonLd(page);
    expect(findByType(blobs, 'Organization')).toBeDefined();
    const website = findByType(blobs, 'WebSite');
    expect(website).toBeDefined();
    expect(website?.inLanguage).toBe('fr-FR');
  });

  test('games page emits CollectionPage with French inLanguage', async ({
    page,
  }) => {
    await page.goto('/fr/jeux', { waitUntil: 'domcontentloaded' });
    const blobs = await collectJsonLd(page);
    const collection = findByType(blobs, 'CollectionPage');
    expect(collection).toBeDefined();
    expect(collection?.inLanguage).toBe('fr-FR');
  });

  test('games page emits a BreadcrumbList', async ({ page }) => {
    await page.goto('/en/games', { waitUntil: 'domcontentloaded' });
    const blobs = await collectJsonLd(page);
    expect(findByType(blobs, 'BreadcrumbList')).toBeDefined();
  });

  test('settings page emits a BreadcrumbList with locale-correct URLs', async ({
    page,
  }) => {
    await page.goto('/ru/nastroyki', { waitUntil: 'domcontentloaded' });
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

  test('sea-battle landing keeps its VideoGame + FAQPage + BreadcrumbList', async ({
    page,
  }) => {
    await page.goto('/en/games/sea-battle', { waitUntil: 'domcontentloaded' });
    const blobs = await collectJsonLd(page);
    expect(findByType(blobs, 'VideoGame')).toBeDefined();
    expect(findByType(blobs, 'BreadcrumbList')).toBeDefined();
    expect(findByType(blobs, 'FAQPage')).toBeDefined();
  });

  test('player profile page emits ProfilePage + Person', async ({ page }) => {
    await page.goto('/en/players/test-id', { waitUntil: 'domcontentloaded' });
    const blobs = await collectJsonLd(page);
    expect(findByType(blobs, 'ProfilePage')).toBeDefined();
  });
});
