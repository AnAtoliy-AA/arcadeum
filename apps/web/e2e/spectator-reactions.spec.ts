import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import {
  mockSession,
  navigateTo,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  mockGameSocket,
  checkNoBackendErrors,
} from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

test.describe('Spectator Floating Reactions', () => {
  const roomId = MOCK_OBJECT_ID;

  test.afterEach(async () => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await mockGameSocket(page, roomId, '507f191e810c19729de860ea');
  });

  test('should display floating spectator reaction dock in watch mode and allow reactions', async ({
    page,
  }) => {
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        status: 'lobby',
        visibility: 'public',
        members: [],
      },
    });

    await navigateTo(page, `${routes.gameRoom(roomId)}?mode=watch`);

    await expect(page.getByTestId('spectating-indicator')).toBeVisible();
    await expect(page.getByTestId('spectator-reactions-dock')).toBeVisible();
    await expect(page.getByTestId('spectator-reaction-fire')).toBeVisible();
    await expect(page.getByTestId('spectator-reaction-clap')).toBeVisible();

    await page.getByTestId('spectator-reaction-fire').click();

    await page.getByTestId('spectator-reactions-toggle').click();
    await expect(page.getByTestId('spectator-reaction-fire')).not.toBeVisible();

    await page.getByTestId('spectator-reactions-toggle').click();
    await expect(page.getByTestId('spectator-reaction-fire')).toBeVisible();
  });
});
