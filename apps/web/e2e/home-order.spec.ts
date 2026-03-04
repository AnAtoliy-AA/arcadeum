import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Home Page Section Order', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
  });

  test('sections should be in the correct vertical order', async ({ page }) => {
    const sections = [
      { name: 'Hero', selector: '[data-testid="hero-section"]' },
      { name: 'Featured Games', selector: '#games' },
      {
        name: 'How It Works',
        selector: '[data-testid="how-it-works-section"]',
      },
      { name: 'Why Arcadeum?', selector: '[data-testid="features-section"]' },
      {
        name: 'Watch the Trailer',
        selector: '[data-testid="presentation-section"]',
      },
      { name: 'Project Vision', selector: '#presentation' },
      {
        name: 'Mobile Builds',
        selector: '[data-testid="download-cta-section"]',
      },
      { name: 'Footer', selector: 'footer' },
    ];

    const elements = await Promise.all(
      sections.map(async (s) => {
        const locator = page.locator(s.selector).first();
        await expect(locator).toBeVisible({ timeout: 15000 });
        const box = await locator.boundingBox();
        return { name: s.name, y: box?.y ?? 0 };
      }),
    );

    for (let i = 0; i < elements.length - 1; i++) {
      expect(elements[i].y).toBeLessThan(elements[i + 1].y);
    }
  });
});
