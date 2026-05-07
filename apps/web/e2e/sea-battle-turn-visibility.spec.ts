import { expect } from '@playwright/test';
import { handleRoute } from './fixtures/test-utils';
import {
  test,
  mockSession,
  navigateTo,
  mockGameSocket,
  waitForRoomReady,
  MOCK_OBJECT_ID,
} from './fixtures/test-utils';

const emptyBoard = () =>
  Array(10)
    .fill(null)
    .map(() => Array(10).fill(0));

const battleRoomMock = {
  room: {
    id: '507f191e810c19729de860ec',
    name: 'Turn Visibility Test Room',
    status: 'playing',
    gameId: 'sea_battle_v1',
    hostId: MOCK_OBJECT_ID,
    playerCount: 2,
    maxPlayers: 2,
    visibility: 'public',
    gameOptions: { variant: 'classic' },
    members: [
      { id: MOCK_OBJECT_ID, displayName: 'Test User', isHost: true },
      { id: 'opponent-user', displayName: 'Opponent', isHost: false },
    ],
  },
  session: {
    id: 'session-123',
    roomId: '507f191e810c19729de860ec',
    gameId: 'sea_battle_v1',
    status: 'active',
    state: {
      phase: 'battle',
      players: [
        {
          playerId: MOCK_OBJECT_ID,
          board: emptyBoard(),
          ships: [],
          alive: true,
        },
        {
          playerId: 'opponent-user',
          board: emptyBoard(),
          ships: [],
          alive: true,
        },
      ],
      playerOrder: [MOCK_OBJECT_ID, 'opponent-user'],
      currentTurnIndex: 0,
      logs: [],
    },
  },
};

test.describe('Sea Battle Turn Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should show TARGET badge on opponent board when it is my turn', async ({
    page,
  }) => {
    const roomId = '507f191e810c19729de860ec';
    const userId = MOCK_OBJECT_ID;

    await page.route('**/games/room-info*', async (route) => {
      await handleRoute(route, battleRoomMock);
    });

    await mockGameSocket(page, roomId, userId, {
      gameId: 'sea_battle_v1',
      roomJoinedPayload: {
        ...battleRoomMock.room,
        session: battleRoomMock.session,
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // Opponent section should have TARGET badge
    await expect(page.getByText('TARGET')).toBeVisible();

    // Check for breathe animation class
    const opponentBoardSection = page.locator('.sb-breathe');
    await expect(opponentBoardSection).toBeVisible();
  });

  test('should show DEFENDING badge on my board when it is opponent turn', async ({
    page,
  }) => {
    const roomId = '507f191e810c19729de860ec';
    const userId = MOCK_OBJECT_ID;

    const opponentTurnMock = JSON.parse(JSON.stringify(battleRoomMock));
    opponentTurnMock.session.state.currentTurnIndex = 1;

    await page.route('**/games/room-info*', async (route) => {
      await handleRoute(route, opponentTurnMock);
    });

    await mockGameSocket(page, roomId, userId, {
      gameId: 'sea_battle_v1',
      roomJoinedPayload: {
        ...opponentTurnMock.room,
        session: opponentTurnMock.session,
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // My section should have DEFENDING badge
    await expect(page.getByText('DEFENDING')).toBeVisible();

    // Check for danger breathe animation class
    const myBoardSection = page.locator('.sb-danger-breathe');
    await expect(myBoardSection).toBeVisible();
  });
});
