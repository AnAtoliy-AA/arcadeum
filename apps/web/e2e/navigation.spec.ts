import { expect } from '@playwright/test';
import {
  test,
  ensureNavigationVisible,
  getIsMobile,
} from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
  });

  test('should display header with logo', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    if (getIsMobile(page)) {
      const menuButton = page.getByTestId('mobile-menu-button');
      await expect(menuButton).toBeVisible();
    } else {
      const nav = page.locator('nav').first();
      await expect(nav).toBeVisible();
    }
  });

  test('should navigate to home from any page', async ({ page }) => {
    await navigateTo(page, '/games');

    // Track chunk load errors during client-side navigation
    let chunkLoadError = false;
    const onPageError = (err: Error) => {
      if (
        err.message.includes('ChunkLoadError') ||
        err.message.includes('Failed to load chunk') ||
        err.message.includes("Can't find Tamagui")
      ) {
        chunkLoadError = true;
      }
    };
    page.on('pageerror', onPageError);

    // Use a more robust selector for the home link/logo
    const homeLink = page.locator('header a[href="/"]').first();
    await expect(homeLink).toBeVisible();

    // Ensure the link is stable and clickable
    await homeLink.waitFor({ state: 'visible' });
    // Click on the home link/logo
    await homeLink.click();

    // If chunk errors occurred during client-side navigation, reload
    if (chunkLoadError) {
      await page.reload({ waitUntil: 'domcontentloaded' });
    }
    page.off('pageerror', onPageError);

    // Increased timeout for check and ensure we wait for URL to be exactly /
    await expect(page).toHaveURL('/', {});

    // Wait for hydration on the home page
    await expect(page.locator('html')).toHaveAttribute(
      'data-hydrated',
      'true',
      {},
    );
  });

  test('should navigate to games page', async ({ page }) => {
    await ensureNavigationVisible(page);
    const gamesLink = getIsMobile(page)
      ? page.getByTestId('mobile-nav-games')
      : page.getByTestId('nav-games');
    await expect(gamesLink).toBeVisible();
    await gamesLink.click();
    await expect(page).toHaveURL(/\/games/, {});
  });

  test('should navigate to auth page', async ({ page }) => {
    if (getIsMobile(page)) {
      // On mobile, login lives inside the drawer (the header indicator is
      // hidden at $sm). Open the menu and click the drawer login CTA.
      await page.getByTestId('mobile-menu-button').click();
      const loginLink = page
        .getByTestId('mobile-nav')
        .getByTestId('mobile-login-button');
      await expect(loginLink).toBeVisible();
      await loginLink.click();
      await expect(page).toHaveURL(/\/auth/);
    } else {
      const loginLink = page.getByTestId('desktop-login-button');
      await expect(loginLink).toBeVisible();
      await loginLink.click();
      await expect(page).toHaveURL(/\/auth/);
    }
  });
});
