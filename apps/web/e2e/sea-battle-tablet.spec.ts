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

const placementRoomMock = {
  room: {
    id: '507f191e810c19729de860ec',
    name: 'Tablet Test Room',
    status: 'playing',
    gameId: 'sea_battle_v1',
    hostId: MOCK_OBJECT_ID,
    playerCount: 1,
    maxPlayers: 2,
    visibility: 'public',
    gameOptions: { variant: 'classic' },
    members: [{ id: MOCK_OBJECT_ID, displayName: 'Test User', isHost: true }],
  },
  session: {
    id: 'session-123',
    roomId: '507f191e810c19729de860ec',
    gameId: 'sea_battle_v1',
    status: 'active',
    state: {
      phase: 'placement',
      players: [
        {
          playerId: MOCK_OBJECT_ID,
          board: emptyBoard(),
          ships: [],
          alive: true,
        },
      ],
      playerOrder: [MOCK_OBJECT_ID],
      currentTurnIndex: 0,
      logs: [],
    },
  },
};

const battleRoomMock = {
  room: {
    ...placementRoomMock.room,
    playerCount: 2,
    members: [
      { id: MOCK_OBJECT_ID, displayName: 'Test User', isHost: true },
      { id: 'opponent-user', displayName: 'Opponent', isHost: false },
    ],
  },
  session: {
    ...placementRoomMock.session,
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

test.describe('Sea Battle Tablet Layout', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should have side-by-side layout on landscape tablet (1024x768)', async ({
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

    await page.setViewportSize({ width: 1024, height: 768 });
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    const mainArea = page.getByTestId('game-main-area');
    await expect(mainArea).toBeVisible();

    // Check if flex-direction is column (for screens < 1150px)
    const flexDirection = await mainArea.evaluate(
      (el) => getComputedStyle(el).flexDirection,
    );
    expect(flexDirection).toBe('column');

    // At ≤1150px chat is hidden by default — toggle it open first
    const toggleChatButton = page.getByTestId('toggle-chat-button');
    await expect(toggleChatButton).toBeVisible();
    await toggleChatButton.click();

    const chatArea = page.getByTestId('game-chat-area');
    await expect(chatArea).toBeVisible();

    // Check if grids container uses grid layout with 2 columns
    const containerDisplay = await mainArea
      .getByTestId('sea-battle-grids-container')
      .evaluate((el) => getComputedStyle(el).display);
    expect(containerDisplay).toBe('grid');

    const gridColumns = await mainArea
      .getByTestId('sea-battle-grids-container')
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    // Should have 2 columns (e.g., "500px 500px" or similar)
    expect(gridColumns.split(' ').length).toBe(2);
  });

  test('should have stacked layout on portrait tablet (768x1024)', async ({
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

    await page.setViewportSize({ width: 768, height: 1024 });
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    const mainArea = page.getByTestId('game-main-area');
    await expect(mainArea).toBeVisible();

    // Check if flex-direction is column (for mobile/portrait tablet < 900px)
    const flexDirection = await mainArea.evaluate(
      (el) => getComputedStyle(el).flexDirection,
    );
    expect(flexDirection).toBe('column');
  });

  test('should show boards and ship palette correctly on tablet', async ({
    page,
  }) => {
    const roomId = '507f191e810c19729de860ec';
    const userId = MOCK_OBJECT_ID;

    await page.route('**/games/room-info*', async (route) => {
      await handleRoute(route, placementRoomMock);
    });

    await mockGameSocket(page, roomId, userId, {
      gameId: 'sea_battle_v1',
      roomJoinedPayload: {
        ...placementRoomMock.room,
        session: placementRoomMock.session,
      },
    });

    await page.setViewportSize({ width: 1024, height: 768 });
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // Board should be visible
    const board = page.getByTestId('sea-battle-board-grid').first();
    await expect(board).toBeVisible();

    // Ship palette should be visible
    const palette = page.getByTestId('sea-battle-ship-palette');
    await expect(palette).toBeVisible();

    // Ship palette should be horizontal on tablet
    const paletteFlexDirection = await palette.evaluate(
      (el) => getComputedStyle(el).flexDirection,
    );
    expect(paletteFlexDirection).toBe('row');
  });
});
