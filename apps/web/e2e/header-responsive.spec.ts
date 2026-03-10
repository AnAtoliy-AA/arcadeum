import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Header Responsive Layout', () => {
  test('should show desktop menu at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await navigateTo(page, '/');

    // Nav should be visible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Mobile menu button should be hidden
    const mobileMenuButton = page.getByTestId('mobile-menu-button');
    await expect(mobileMenuButton).not.toBeVisible();
  });

  test('should show mobile menu at 1100px (new breakpoint)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await navigateTo(page, '/');

    // Nav should be hidden
    const nav = page.locator('nav');
    await expect(nav).not.toBeVisible();

    // Mobile menu button should be visible
    const mobileMenuButton = page.getByTestId('mobile-menu-button');
    await expect(mobileMenuButton).toBeVisible();
  });

  test('should have reduced gap at 1200px', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await navigateTo(page, '/');

    const headerInner = page.locator('header > div').first();
    const gap = await headerInner.evaluate(
      (el) => window.getComputedStyle(el).gap,
    );
    expect(gap).toBe('16px'); // 1rem = 16px
  });
});
