import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';

interface SchemaRecord {
  '@type'?: string | string[];
  '@id'?: string;
  name?: string;
  url?: string;
  inLanguage?: string;
  aggregateRating?: {
    '@type'?: string;
    ratingValue?: string;
    ratingCount?: string;
  };
}

async function getJsonLdSchemas(
  page: import('@playwright/test').Page,
  selector: string,
): Promise<SchemaRecord[]> {
  await page.waitForSelector(selector, { state: 'attached' });
  const text = await page.locator(selector).textContent();
  if (!text) return [];
  const parsed: unknown = JSON.parse(text);
  return Array.isArray(parsed)
    ? (parsed as SchemaRecord[])
    : [parsed as SchemaRecord];
}

const TARGET_GAMES = [
  { slug: 'backgammon', id: 'backgammon', name: 'Backgammon' },
  { slug: 'critical', id: 'critical', name: 'Critical' },
  { slug: 'glimworm', id: 'glimworm', name: 'Glimworm' },
  { slug: 'sea-battle', id: 'sea-battle', name: 'Sea Battle' },
  { slug: 'solitaire', id: 'solitaire', name: 'Solitaire' },
  { slug: 'sudoku', id: 'sudoku', name: 'Sudoku' },
];

test.describe('Game Landings Structured Data & SEO Verification', () => {
  for (const game of TARGET_GAMES) {
    test(`${game.name} landing emits VideoGame, SoftwareApplication with AggregateRating`, async ({
      page,
    }) => {
      await page.goto(`/en/games/${game.slug}`, {
        waitUntil: 'domcontentloaded',
      });
      const schemas = await getJsonLdSchemas(page, `#json-ld-${game.id}`);
      expect(schemas.length).toBeGreaterThanOrEqual(2);

      const videoGame = schemas.find((s) => s['@type'] === 'VideoGame');
      expect(videoGame).toBeDefined();
      expect(videoGame?.url).toContain(`/games/${game.slug}`);
      expect(videoGame?.url).not.toContain('_v1');
      expect(videoGame?.aggregateRating?.['@type']).toBe('AggregateRating');
      expect(videoGame?.aggregateRating?.ratingValue).toBeTruthy();

      const softwareApp = schemas.find(
        (s) => s['@type'] === 'SoftwareApplication',
      );
      expect(softwareApp).toBeDefined();
      expect(softwareApp?.url).toContain(`/games/${game.slug}`);
      expect(softwareApp?.aggregateRating?.['@type']).toBe('AggregateRating');

      const breadcrumbLists = schemas.filter(
        (s) => s['@type'] === 'BreadcrumbList',
      );
      expect(breadcrumbLists.length).toBeLessThanOrEqual(1);
    });
  }

  test('sitemap includes all games and strategy guides', async ({
    request,
  }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const text = await res.text();

    const expectedSlugs = [
      'chess',
      'backgammon',
      'battleship',
      'sea-battle',
      'critical',
      'glimworm',
      'hearts',
      'spades',
      'go',
      'pachisi',
      'solitaire',
      'minesweeper',
      'sudoku',
      '2048',
    ];

    for (const slug of expectedSlugs) {
      expect(text).toContain(`/games/${slug}`);
    }

    const expectedGuides = [
      'chess-opening-traps',
      'how-to-win-chess-endgames',
      'how-to-win-spades',
      'how-to-win-hearts-advanced',
      'backgammon-pip-count-guide',
    ];

    for (const guide of expectedGuides) {
      expect(text).toContain(`/blog/${guide}`);
    }
  });
});
