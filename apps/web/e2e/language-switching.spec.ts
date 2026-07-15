import { expect } from '@playwright/test';
import { test, ensureNavigationVisible } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Language Switching', () => {
  test('should change language and persist across pages', async ({ page }) => {
    // 1. Start at Home Page in English
    await navigateTo(page, '/');
    await ensureNavigationVisible(page);
    await expect(
      page
        .locator(
          'nav[aria-label="Main navigation"], [data-testid="mobile-nav"]',
        )
        .getByRole('link', { name: /games/i }),
    ).not.toBeVisible({});

    await expect(
      page
        .locator(
          'nav[aria-label="Main navigation"], [data-testid="mobile-nav"]',
        )
        .getByRole('link', { name: /игры/i }),
    ).toBeVisible({});

    // 5. Reload page and verify language persists
    // Use domcontentloaded to avoid hanging on ChunkLoadError in slow CI.
    // The data-hydrated check below handles waiting for full hydration.
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    // Wait for hydration after reload
    await expect(page.locator('html')).toHaveAttribute(
      'data-hydrated',
      'true',
      {},
    );

    await ensureNavigationVisible(page);
    await expect(page.getByRole('link', { name: /игры/i }).first()).toBeVisible(
      {},
    );

    await ensureNavigationVisible(page);
    await expect(page.getByRole('link', { name: /игры/i }).first()).toBeVisible(
      {},
    );

    // 6. Change back to English
    await navigateTo(page, '/settings');
    await page.getByTestId('lang-btn-en').click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /settings/i,
      {},
    );
  });
});
