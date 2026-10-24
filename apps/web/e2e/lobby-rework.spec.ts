import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  mockRoomInfo,
  navigateTo,
  waitForRoomReady,
  mockGameSocket,
  MOCK_OBJECT_ID,
} from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

test.describe('Lobby UX Rework - Setup Card & Hero Layout', () => {
  const roomId = '507f191e810c19729de860ec';

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await mockGameSocket(page, roomId, MOCK_OBJECT_ID);
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Reworked Lobby Room',
        gameId: 'go_v1',
        status: 'lobby',
        hostId: MOCK_OBJECT_ID,
        playerCount: 1,
        maxPlayers: 2,
        members: [
          {
            id: MOCK_OBJECT_ID,
            userId: MOCK_OBJECT_ID,
            displayName: 'HostPlayer',
            isHost: true,
          },
        ],
        gameOptions: {
          boardSize: 19,
          variant: 'cyberpunk',
        },
      },
    });
  });

  test('should display reworked lobby hero and game setup card with board options', async ({
    page,
  }) => {
    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    const roomTitle = page.getByTestId('room-name-text');
    await expect(roomTitle).toHaveText('Reworked Lobby Room');

    const settingsCard = page.getByTestId('lobby-game-settings-card');
    await expect(settingsCard).toBeVisible();

    const boardSize19Btn = page.getByTestId('go-board-size-19');
    await expect(boardSize19Btn).toBeVisible();

    const boardSize13Btn = page.getByTestId('go-board-size-13');
    await expect(boardSize13Btn).toBeVisible();

    const hostBadge = page.getByText('HOST', { exact: true });
    await expect(hostBadge).toBeVisible();
  });
});
