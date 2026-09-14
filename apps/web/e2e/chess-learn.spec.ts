import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import {
  navigateTo,
  mockSession,
  checkNoBackendErrors,
} from './fixtures/test-utils';

test.describe('Chess Learn Coordinate Trainer', () => {
  test.afterEach(() => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('renders chess coordinate trainer and starts a training session', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/chess/learn');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Chess Training' }),
    ).toBeVisible();
    await expect(
      page.getByText(
        'Master chess coordinates to improve your speed and communication',
      ),
    ).toBeVisible();

    const findSquareButton = page.getByRole('button', {
      name: 'Find the Square',
    });
    const nameSquareButton = page.getByRole('button', {
      name: 'Name the Square',
    });
    const perspectiveButton = page.getByRole('button', {
      name: 'Black Perspective',
    });

    await expect(findSquareButton).toBeVisible();
    await expect(nameSquareButton).toBeVisible();
    await expect(perspectiveButton).toBeVisible();

    await perspectiveButton.click();
    await expect(
      page.getByRole('button', { name: 'White Perspective' }),
    ).toBeVisible();

    await findSquareButton.click();
    await expect(page.getByText(/Find:/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Quit' })).toBeVisible();
  });
});
