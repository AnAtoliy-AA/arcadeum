import { expect } from '@playwright/test';
import { test, navigateTo, ensureNavigationVisible } from './fixtures/test-utils';

test.describe('Header and Footer Modernization', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
  });

  test('header should have glassmorphism effect', async ({ page }) => {
    const header = page.locator('header').first();
    const backdropFilter = await header.evaluate((el) => {
      return window.getComputedStyle(el).backdropFilter;
    });
    // The actual value might be "blur(32px) saturate(200%)" or similar depending on browser
    expect(backdropFilter).toContain('blur');
  });

  test('footer should have glassmorphism effect', async ({ page }) => {
    const footer = page.locator('footer > div').first();
    const backdropFilter = await footer.evaluate((el) => {
      return window.getComputedStyle(el).backdropFilter;
    });
    expect(backdropFilter).toContain('blur');
  });

  test('navigation links should have indicators', async ({ page }) => {
    await ensureNavigationVisible(page);
    // Homepage link in nav should be active
    const activeIndicator = page.locator('nav > div').first().locator('div').last();
    const opacity = await activeIndicator.evaluate((el) => window.getComputedStyle(el).opacity);
    expect(parseFloat(opacity)).toBeGreaterThan(0);
  });

  test('logo should have hover effect', async ({ page }) => {
    const logo = page.locator('header a[href="/"]').first();
    await logo.hover();
    const transform = await logo.evaluate((el) => window.getComputedStyle(el).transform);
    // "scale(1.02)" results in a matrix like matrix(1.02, 0, 0, 1.02, 1, 0)
    expect(transform).toContain('matrix');
  });

  test('footer social icons should have hover effect', async ({ page }) => {
    const socialIcons = page.getByTestId(/footer-social-/);
    const firstIcon = socialIcons.first();
    await firstIcon.hover();
    const transform = await firstIcon.evaluate((el) => window.getComputedStyle(el).transform);
    expect(transform).toContain('matrix');
  });
});
