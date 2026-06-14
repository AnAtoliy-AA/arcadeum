import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  navigateTo,
  closeGameRulesModal,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  mockGameSocket,
  checkNoBackendErrors,
  waitForRoomReady,
  clickButtonByTestId,
} from './fixtures/test-utils';

test.describe('Sea Battle Bot Count Selection', () => {
  test.afterEach(async () => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should allow selecting 4 bots in Sea Battle and starting game', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';

    const generateBoard = () =>
      Array(10)
        .fill(null)
        .map(() => Array(10).fill(0));

    const mockPlacementState = {
      phase: 'placement',
      players: [
        {
          playerId: userId,
          alive: true,
          board: generateBoard(),
          ships: [],
          shipsRemaining: 10,
          placementComplete: false,
        },
        {
          playerId: 'bot-1',
          alive: true,
          board: generateBoard(),
          ships: [],
          shipsRemaining: 10,
          placementComplete: true,
        },
        {
          playerId: 'bot-2',
          alive: true,
          board: generateBoard(),
          ships: [],
          shipsRemaining: 10,
          placementComplete: true,
        },
        {
          playerId: 'bot-3',
          alive: true,
          board: generateBoard(),
          ships: [],
          shipsRemaining: 10,
          placementComplete: true,
        },
        {
          playerId: 'bot-4',
          alive: true,
          board: generateBoard(),
          ships: [],
          shipsRemaining: 10,
          placementComplete: true,
        },
      ],
      playerOrder: [userId, 'bot-1', 'bot-2', 'bot-3', 'bot-4'],
      currentTurnIndex: 0,
      logs: [],
    };

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Sea Battle Bot Test',
        gameId: 'sea_battle_v1',
        maxPlayers: 5,
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
        ],
      },
    });

    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: {
        gameId: 'sea_battle_v1',
        maxPlayers: 5,
        room: {
          id: roomId,
          name: 'Sea Battle Bot Test',
          gameId: 'sea_battle_v1',
          maxPlayers: 5,
          hostId: userId,
          members: [
            { id: userId, userId, displayName: 'Test User', isHost: true },
          ],
        },
      },
      handlers: {
        'seaBattle.session.start': {
          responseEvent: 'games.session.started',
          responseData: {
            session: {
              id: '507f191e810c19729de860f1',
              status: 'active',
              state: mockPlacementState,
            },
          },
        },
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);
    await closeGameRulesModal(page);

    await expect(page.locator('body')).toContainText(
      /bots|number of bots/i,
      {},
    );

    const botButton4 = page.getByTestId('bot-count-4');
    await expect(botButton4).toBeVisible({});
    await clickButtonByTestId(page, 'bot-count-4');

    const startBtn = page.getByTestId('start-with-bots-button');
    await expect(startBtn).toBeVisible({});
    await startBtn.evaluate((btn) => (btn as HTMLButtonElement).click());

    await expect(page.getByText(/place your ships/i).first()).toBeVisible({});
  });
});
