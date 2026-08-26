import { test, expect, navigateTo } from './fixtures/test-utils';

test.describe('Features Page', () => {
  test('should render features page with hero, stats, and sections', async ({
    page,
  }) => {
    await navigateTo(page, '/features');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toContainText(
      'Platform Architecture & Features',
    );
    await expect(page.getByTestId('stat-modules')).toBeVisible();
    await expect(page.getByTestId('stat-games')).toBeVisible();
    await expect(page.getByText('1. Games (20+)')).toBeVisible();
  });

  test('should filter sections by search query and clear', async ({ page }) => {
    await navigateTo(page, '/features');
    await page.waitForLoadState('domcontentloaded');

    const searchInput = page.getByTestId('features-search-input');
    await searchInput.fill('WebSocket');

    await expect(page.getByText('8. Real-Time (WebSocket)')).toBeVisible();
    await expect(page.getByText('1. Games (20+)')).not.toBeVisible();

    const clearButton = page.getByTestId('features-search-clear');
    await clearButton.click();

    await expect(page.getByText('1. Games (20+)')).toBeVisible();
  });

  test('should filter sections by category', async ({ page }) => {
    await navigateTo(page, '/features');
    await page.waitForLoadState('domcontentloaded');

    const gamesChip = page.getByTestId('filter-games');
    await gamesChip.click();

    await expect(page.getByText('1. Games (20+)')).toBeVisible();
    await expect(page.getByText('2. Game Session & Matchmaking')).toBeVisible();
    await expect(page.getByText('8. Real-Time (WebSocket)')).not.toBeVisible();

    const allChip = page.getByTestId('filter-all');
    await allChip.click();

    await expect(page.getByText('8. Real-Time (WebSocket)')).toBeVisible();
  });

  test('should switch view modes between categorized, matrix, and directory', async ({
    page,
  }) => {
    await navigateTo(page, '/features');
    await page.waitForLoadState('domcontentloaded');

    const matrixButton = page.getByTestId('features-view-matrix');
    await matrixButton.click();

    await expect(page.getByText('Explore →').first()).toBeVisible();

    const directoryButton = page.getByTestId('features-view-directory');
    await directoryButton.click();

    await expect(page.getByText('Directory Index')).toBeVisible();

    const fullViewButton = page.getByTestId('features-view-categorized');
    await fullViewButton.click();

    await expect(page.getByText('1. Games (20+)')).toBeVisible();
  });

  test('should render markdown tables within sections', async ({ page }) => {
    await navigateTo(page, '/features');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByText('Multiplayer Board Games')).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Game' }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Players' }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Chess' }).first(),
    ).toBeVisible();
  });
});
