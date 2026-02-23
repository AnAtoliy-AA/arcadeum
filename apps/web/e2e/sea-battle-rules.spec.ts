import { test, expect } from '@playwright/test';
import {
  mockSession,
  navigateTo,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  checkNoBackendErrors,
} from './fixtures/test-utils';

test.describe('Sea Battle Rules Modal', () => {
  test.afterEach(async () => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should show rules modal automatically when entering game', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Rules Test Room',
        gameId: 'sea_battle_v1',
        gameOptions: { variant: 'classic' },
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);

    // Modal should be visible automatically
    await expect(
      page.getByRole('heading', {
        name: /Game Rules|games\.sea_battle_v1\.rules\.title/i,
      }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText(
        /Objective|games\.sea_battle_v1\.rules\.headers\.objective/i,
      ),
    ).toBeVisible();
  });

  test('should be able to close and reopen rules modal', async ({ page }) => {
    const roomId = '507f1f77bcf86cd799439011'; // Another valid ObjectId

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Rules Toggle Room',
        gameId: 'sea_battle_v1',
        gameOptions: { variant: 'classic' },
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);

    // Wait for modal and close it
    await expect(
      page.getByRole('heading', {
        name: /Game Rules|games\.sea_battle_v1\.rules\.title/i,
      }),
    ).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: '×' }).click();
    await expect(
      page.getByRole('heading', {
        name: /Game Rules|games\.sea_battle_v1\.rules\.title/i,
      }),
    ).not.toBeVisible();

    // Reopen via header button
    await page
      .getByRole('button', { name: /Rules|📖/i })
      .click({ timeout: 5000 });
    await expect(
      page.getByRole('heading', {
        name: /Game Rules|games\.sea_battle_v1\.rules\.title/i,
      }),
    ).toBeVisible();
  });

  test('should be able to view rules from create game screen', async ({
    page,
  }) => {
    await navigateTo(page, '/games/create?gameId=sea_battle_v1');
    await page.waitForLoadState('networkidle');

    // Click "View Game Rules"
    const rulesButton = page.getByRole('button', { name: /Game Rules|📖/i });
    await expect(rulesButton).toBeVisible({ timeout: 10000 });
    await rulesButton.click();

    // Modal should be visible
    await expect(
      page.getByRole('heading', {
        name: /Game Rules|games\.sea_battle_v1\.rules\.title/i,
      }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText(
        /Objective|games\.sea_battle_v1\.rules\.headers\.objective/i,
      ),
    ).toBeVisible();

    // Close it
    await page.getByRole('button', { name: '×' }).click();
    await expect(
      page.getByRole('heading', {
        name: /Game Rules|games\.sea_battle_v1\.rules\.title/i,
      }),
    ).not.toBeVisible();
  });
});
