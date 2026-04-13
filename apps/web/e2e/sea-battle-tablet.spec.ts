import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { mockSession, navigateTo } from './fixtures/test-utils';

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
    hostId: 'test-user',
    playerCount: 1,
    maxPlayers: 2,
    visibility: 'public',
    gameOptions: { variant: 'classic' },
    members: [{ id: 'test-user', displayName: 'Test User', isHost: true }],
  },
  session: {
    id: 'session-123',
    roomId: '507f191e810c19729de860ec',
    gameId: 'sea_battle_v1',
    status: 'active',
    state: {
      phase: 'placement',
      players: [
        { playerId: 'test-user', board: emptyBoard(), ships: [], alive: true },
      ],
      playerOrder: ['test-user'],
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
      { id: 'test-user', displayName: 'Test User', isHost: true },
      { id: 'opponent-user', displayName: 'Opponent', isHost: false },
    ],
  },
  session: {
    ...placementRoomMock.session,
    state: {
      phase: 'battle',
      players: [
        { playerId: 'test-user', board: emptyBoard(), ships: [], alive: true },
        {
          playerId: 'opponent-user',
          board: emptyBoard(),
          ships: [],
          alive: true,
        },
      ],
      playerOrder: ['test-user', 'opponent-user'],
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
    await page.route('**/games/room-info*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: battleRoomMock,
      });
    });
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);
    await navigateTo(page, '/games/rooms/507f191e810c19729de860ec');

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

    // Check if grids container uses row layout (flexbox)
    const containerFlexDirection = await mainArea
      .getByTestId('sea-battle-grids-container')
      .evaluate((el) => getComputedStyle(el).flexDirection);
    expect(containerFlexDirection).toBe('column');
  });

  test('should have stacked layout on portrait tablet (768x1024)', async ({
    page,
  }) => {
    await page.route('**/games/room-info*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: battleRoomMock,
      });
    });
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await navigateTo(page, '/games/rooms/507f191e810c19729de860ec');

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
    await page.route('**/games/room-info*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: placementRoomMock,
      });
    });
    await page.setViewportSize({ width: 1024, height: 768 });
    await navigateTo(page, '/games/rooms/507f191e810c19729de860ec');

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
