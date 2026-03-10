import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { mockSession, navigateTo } from './fixtures/test-utils';

test.describe('Sea Battle Tablet Layout', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);

    // Mock room info API to show a game in placement phase
    await page.route('**/games/room-info*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          room: {
            id: 'tablet-test-room',
            name: 'Tablet Test Room',
            status: 'playing',
            gameId: 'sea_battle_v1',
            hostId: 'test-user',
            playerCount: 1,
            maxPlayers: 2,
            visibility: 'public',
            gameOptions: { variant: 'classic' },
            members: [
              {
                id: 'test-user',
                displayName: 'Test User',
                isHost: true,
              },
            ],
          },
          session: {
            id: 'session-123',
            roomId: 'tablet-test-room',
            gameId: 'sea_battle_v1',
            status: 'active',
            state: {
              phase: 'placement',
              players: [
                {
                  playerId: 'test-user',
                  board: Array(10)
                    .fill(null)
                    .map(() => Array(10).fill(0)),
                  ships: [],
                  alive: true,
                },
              ],
              playerOrder: ['test-user'],
              currentTurnIndex: 0,
              logs: [],
            },
          },
        },
      });
    });
  });

  test('should have side-by-side layout on landscape tablet (1024x768)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await navigateTo(page, '/games/rooms/tablet-test-room');

    const mainArea = page.getByTestId('game-main-area');
    await expect(mainArea).toBeVisible();

    // Check if flex-direction is row (default for desktop/large tablet)
    const flexDirection = await mainArea.evaluate(
      (el) => getComputedStyle(el).flexDirection,
    );
    expect(flexDirection).toBe('row');

    const chatArea = page.getByTestId('game-chat-area');
    await expect(chatArea).toBeVisible();

    // Check if boards are in 2 columns
    const boardArea = page.getByTestId('game-board-area');
    const gridTemplateColumns = await boardArea
      .getByTestId('sea-battle-grids-container')
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    // Should have 2 columns (e.g., "span 1 / span 1" or explicit pixel values)
    const columnsCount = gridTemplateColumns.split(' ').length;
    expect(columnsCount).toBeGreaterThanOrEqual(2);
  });

  test('should have stacked layout on portrait tablet (768x1024)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await navigateTo(page, '/games/rooms/tablet-test-room');

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
    await page.setViewportSize({ width: 1024, height: 768 });
    await navigateTo(page, '/games/rooms/tablet-test-room');

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
