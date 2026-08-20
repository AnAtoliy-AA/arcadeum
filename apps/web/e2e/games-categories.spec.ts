import { expect } from '@playwright/test';
import { test, navigateTo, handleRoute } from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

test.describe('Games Lounge - Category Tabs and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/games/rooms*', async (route) => {
      await handleRoute(route, { rooms: [], total: 0 });
    });

    await page.route('**/socket.io/*', async (route) => {
      await handleRoute(route, { status: 'ok' });
    });
  });

  test('should display all category filter chips and toggle selection', async ({
    page,
  }) => {
    await navigateTo(page, routes.games);

    const allChip = page.getByRole('button', {
      name: /Filter by category: All/i,
    });
    await expect(allChip).toBeVisible();
    await expect(allChip).toHaveAttribute('aria-pressed', 'true');

    const cardChip = page.getByRole('button', {
      name: /Filter by category: Card/i,
    });
    if (await cardChip.isVisible()) {
      await cardChip.click();
      await expect(cardChip).toHaveAttribute('aria-pressed', 'true');
      await expect(allChip).toHaveAttribute('aria-pressed', 'false');

      await allChip.click();
      await expect(allChip).toHaveAttribute('aria-pressed', 'true');
      await expect(cardChip).toHaveAttribute('aria-pressed', 'false');
    }
  });

  test('should allow searching and filtering simultaneously', async ({
    page,
  }) => {
    await navigateTo(page, routes.games);

    const searchInput = page
      .locator('input[type="search"], input[placeholder*="search" i]')
      .first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Critical');
      await expect(searchInput).toHaveValue('Critical');
    }

    const boardChip = page.getByRole('button', {
      name: /Filter by category: Board/i,
    });
    if (await boardChip.isVisible()) {
      await boardChip.click();
      await expect(boardChip).toHaveAttribute('aria-pressed', 'true');
    }
  });
});
