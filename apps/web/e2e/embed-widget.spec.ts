import { expect } from '@playwright/test';
import { test, navigateTo, checkNoBackendErrors } from './fixtures/test-utils';

test.describe('Embed Game Widgets', () => {
  test.afterEach(() => {
    checkNoBackendErrors();
  });

  test('renders tic-tac-toe embed widget with default theme', async ({
    page,
  }) => {
    await navigateTo(page, '/en/embed/tic-tac-toe');
    await expect(page.getByText('Tic-Tac-Toe')).toBeVisible();
    await expect(page.getByText('Game loading...')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'arcadeum.games' }),
    ).toBeVisible();
  });

  test('respects theme and size search parameters', async ({ page }) => {
    await navigateTo(page, '/en/embed/2048?theme=light&size=compact');
    await expect(page.getByText('2048')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'arcadeum.games' }),
    ).toBeVisible();
  });

  test('handles postMessage configuration from parent window', async ({
    page,
  }) => {
    await navigateTo(page, '/en/embed/minesweeper');
    await expect(page.getByText('Minesweeper')).toBeVisible();

    await page.evaluate(() => {
      window.postMessage(
        { type: 'configure', theme: 'light', size: 'compact' },
        window.location.origin,
      );
    });

    await expect(
      page.getByRole('link', { name: 'arcadeum.games' }),
    ).toBeVisible();
  });
});
