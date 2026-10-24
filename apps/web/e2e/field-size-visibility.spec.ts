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

test.describe('Lobby Field Size Visibility', () => {
  const tttRoomId = '507f191e810c19729de860ed';
  const goRoomId = '507f191e810c19729de860ee';

  test('should prominently display field size badge and field size selector in Tic-Tac-Toe lobby', async ({
    page,
  }) => {
    await mockSession(page);
    await mockGameSocket(page, tttRoomId, MOCK_OBJECT_ID);
    await mockRoomInfo(page, {
      room: {
        id: tttRoomId,
        name: 'TicTacToe Lounge',
        gameId: 'tic_tac_toe_v1',
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
          boardSize: 3,
        },
      },
    });

    await navigateTo(page, routes.gameRoom(tttRoomId));
    await waitForRoomReady(page);

    const fieldSizeBadge = page.getByTestId('lobby-field-size-badge');
    await expect(fieldSizeBadge).toBeVisible();
    await expect(fieldSizeBadge).toHaveText(/Field:\s*3×3/);

    const fieldSizeSelector = page.getByTestId('field-size-selector');
    await expect(fieldSizeSelector).toBeVisible();

    const size5Btn = page.getByTestId('ttt-board-size-5');
    await expect(size5Btn).toBeVisible();
  });

  test('should prominently display field size badge and selector in Go lobby', async ({
    page,
  }) => {
    await mockSession(page);
    await mockGameSocket(page, goRoomId, MOCK_OBJECT_ID);
    await mockRoomInfo(page, {
      room: {
        id: goRoomId,
        name: 'Go Master Room',
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
        },
      },
    });

    await navigateTo(page, routes.gameRoom(goRoomId));
    await waitForRoomReady(page);

    const fieldSizeBadge = page.getByTestId('lobby-field-size-badge');
    await expect(fieldSizeBadge).toBeVisible();
    await expect(fieldSizeBadge).toHaveText(/Field:\s*19×19/);

    const goBoardSection = page.getByTestId('go-board-size-section');
    await expect(goBoardSection).toBeVisible();

    const size13Btn = page.getByTestId('go-board-size-13');
    await expect(size13Btn).toBeVisible();
  });
});
