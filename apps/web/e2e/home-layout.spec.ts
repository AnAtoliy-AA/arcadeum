import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Home Page Layout', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
    // Disable animations for stable testing
    await page.addStyleTag({
      content:
        '[data-reveal] { opacity: 1 !important; transform: none !important; transition: none !important; }',
    });
  });

  test('H1 should be large on desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Testing desktop size');
    await page.setViewportSize({ width: 1440, height: 900 });

    const h1 = page.locator('h1#hero-heading');
    await expect(h1).toBeVisible();

    const fontSize = await h1.evaluate(
      (el) => window.getComputedStyle(el).fontSize,
    );
    expect(parseInt(fontSize)).toBeGreaterThanOrEqual(100);
  });

  test('H1 should be appropriately sized on mobile', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Testing mobile size');

    const h1 = page.locator('h1#hero-heading');
    await expect(h1).toBeVisible();

    const fontSize = await h1.evaluate(
      (el) => window.getComputedStyle(el).fontSize,
    );
    expect(parseInt(fontSize)).toBeGreaterThanOrEqual(40);
  });

  test('Pitch Deck should not overflow on mobile', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Testing mobile size');

    const pitchDeck = page.locator('#pitch-deck');
    await expect(pitchDeck).toBeVisible();

    const box = await pitchDeck.boundingBox();
    const viewport = page.viewportSize();

    expect(box?.width).toBeLessThanOrEqual(viewport?.width || 0);
  });

  test('WebPresentation should maintain aspect ratio on mobile', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Testing mobile size');

    const presentation = page.locator('.presentation-container');
    await expect(presentation).toBeVisible();

    const box = await presentation.boundingBox();
    if (box) {
      const ratio = box.width / box.height;
      // Should be close to 16/9 (1.77)
      expect(ratio).toBeGreaterThan(1.5);
      expect(ratio).toBeLessThan(2.0);
    }
  });

  test('Tagline should be prominent', async ({ page }) => {
    const tagline = page.locator('.hero-tagline-main');
    await expect(tagline).toBeVisible();

    const fontWeight = await tagline.evaluate(
      (el) => window.getComputedStyle(el).fontWeight,
    );
    expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(700);
  });
});
