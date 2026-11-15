import { expect } from '@playwright/test';
import { test, navigateTo, mockSession } from './fixtures/test-utils';

test.describe('Strategy Guides & SEO Cluster', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('blog index lists pillar strategy guides with tags', async ({
    page,
  }) => {
    await navigateTo(page, '/en/blog');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toBeVisible();

    const openingTrapsCard = page.getByRole('link', {
      name: /10 Chess Opening Traps/i,
    });
    await expect(openingTrapsCard.first()).toBeVisible();

    const spadesCard = page.getByRole('link', {
      name: /How to Win at Spades/i,
    });
    await expect(spadesCard.first()).toBeVisible();
  });

  test('chess landing page renders related strategy articles cross-links', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess');
    await page.waitForLoadState('domcontentloaded');

    const relatedHeading = page.locator('#related-articles-heading');
    await expect(relatedHeading).toBeVisible();
    await expect(relatedHeading).toContainText('Guides & strategy');

    const trapsLink = page.locator('a[href*="chess-opening-traps"]').first();
    await expect(trapsLink).toBeVisible();
  });

  test('spades landing page renders related strategy articles cross-links', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/spades');
    await page.waitForLoadState('domcontentloaded');

    const relatedHeading = page.locator('#related-articles-heading');
    await expect(relatedHeading).toBeVisible();
    await expect(relatedHeading).toContainText('Guides & strategy');

    const spadesGuideLink = page
      .locator('a[href*="how-to-win-spades"]')
      .first();
    await expect(spadesGuideLink).toBeVisible();
  });

  test('strategy guide article renders reading aids, CTA, and structured data', async ({
    page,
  }) => {
    await navigateTo(page, '/en/blog/chess-opening-traps');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText('10 Chess Opening Traps');

    const ctaCard = page.locator('a[href*="/games/chess"]').first();
    await expect(ctaCard).toBeVisible();

    const jsonLd = page.locator('#json-ld-blog-post-chess-opening-traps-en');
    await expect(jsonLd).toBeAttached();
    const ldText = await jsonLd.textContent();
    expect(ldText).toContain('BlogPosting');
    expect(ldText).toContain('chess-opening-traps#article');
    expect(ldText).toContain('chess-opening-traps/opengraph-image');

    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute(
      'content',
      /chess-opening-traps\/opengraph-image/,
    );
  });

  test('localized strategy guide article renders in Russian', async ({
    page,
  }) => {
    await navigateTo(page, '/ru/blog/chess-opening-traps');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText(
      '10 шахматных дебютных ловушек',
    );

    const ctaCard = page.locator('a[href*="/games/chess"]').first();
    await expect(ctaCard).toBeVisible();
  });
});
