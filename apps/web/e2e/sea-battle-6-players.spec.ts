import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import {
  mockSession,
  navigateTo,
  handleRoute,
  mockRoomInfo,
  waitForRoomReady,
} from './fixtures/test-utils';

test.describe('Sea Battle 6 Players Layout', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);

    // Mock socket.io polling to prevent connection errors
    await page.route('**/socket.io/*', async (route) => {
      await handleRoute(route, { status: 'ok' });
    });
  });

  test('should render 6 player boards in a balanced grid on desktop', async ({
    page,
  }) => {
    const roomId = '507f191e810c19729de860eb';

    const members = Array.from({ length: 6 }, (_, i) => ({
      id: `user-${i + 1}`,
      userId: `user-${i + 1}`,
      displayName: `Player ${i + 1}`,
      isHost: i === 0,
    }));

    const players = Array.from({ length: 6 }, (_, i) => ({
      playerId: `user-${i + 1}`,
      alive: true,
      board: Array(10)
        .fill(null)
        .map(() => Array(10).fill(0)),
      ships: [],
      shipsRemaining: 10,
      placementComplete: true,
    }));

    const sessionState = {
      phase: 'battle',
      players,
      playerOrder: players.map((p) => p.playerId),
      currentTurnIndex: 0,
      logs: [],
    };

    // Use established mockRoomInfo helper
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: '6 Player Battle',
        status: 'battle',
        gameId: 'sea_battle_v1',
        hostId: 'user-1',
        playerCount: 6,
        maxPlayers: 6,
        members,
        gameOptions: { variant: 'classic' },
      },
      session: {
        id: 'session-id',
        status: 'active',
        state: sessionState,
      },
    });

    // Mock the session endpoint explicitly as it's often called separately
    await page.route(`**/games/rooms/${roomId}/session*`, async (route) => {
      await handleRoute(route, {
        session: {
          id: 'session-id',
          status: 'active',
          state: sessionState,
        },
      });
    });

    await page.setViewportSize({ width: 1920, height: 1080 });
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // Verify 6 boards are rendered by checking player-board-name count
    const playerNames = page.getByTestId('player-board-name');
    await expect(playerNames).toHaveCount(6);

    const container = page.getByTestId('sea-battle-grids-container');
    await expect(container).toBeVisible();

    // Verify it's using grid display
    const display = await container.evaluate(
      (el) => window.getComputedStyle(el).display,
    );
    expect(display).toBe('grid');
  });

  test('should maintain playable layout on mobile vertical', async ({
    page,
  }) => {
    const roomId = '507f191e810c19729de860ec';

    const members = Array.from({ length: 6 }, (_, i) => ({
      id: `user-${i + 1}`,
      userId: `user-${i + 1}`,
      displayName: `P${i + 1}`,
      isHost: i === 0,
    }));

    const players = Array.from({ length: 6 }, (_, i) => ({
      playerId: `user-${i + 1}`,
      alive: true,
      board: Array(10)
        .fill(null)
        .map(() => Array(10).fill(0)),
      ships: [],
      shipsRemaining: 10,
      placementComplete: true,
    }));

    const sessionState = {
      phase: 'battle',
      players,
      playerOrder: players.map((p) => p.playerId),
      currentTurnIndex: 0,
      logs: [],
    };

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Mobile Battle',
        status: 'battle',
        gameId: 'sea_battle_v1',
        hostId: 'user-1',
        playerCount: 6,
        maxPlayers: 6,
        members,
      },
      session: {
        id: 'session-mobile',
        status: 'active',
        state: sessionState,
      },
    });

    await page.route(`**/games/rooms/${roomId}/session*`, async (route) => {
      await handleRoute(route, {
        session: {
          id: 'session-mobile',
          status: 'active',
          state: sessionState,
        },
      });
    });

    await page.setViewportSize({ width: 375, height: 812 });
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // Verify layout is vertical (YStack uses column)
    const container = page.getByTestId('sea-battle-grids-container');
    const display = await container.evaluate(
      (el) => window.getComputedStyle(el).display,
    );
    // Tamagui YStack is flex by default
    expect(display).toBe('flex');
    const flexDirection = await container.evaluate(
      (el) => window.getComputedStyle(el).flexDirection,
    );
    expect(flexDirection).toBe('column');

    // Check that boards are not too wide
    const firstBoard = page.getByTestId('player-board-name').first();
    const width = await firstBoard.evaluate(
      (el) => el.getBoundingClientRect().width,
    );
    expect(width).toBeLessThanOrEqual(375);
  });

  test('should show 2 boards per row on mobile landscape', async ({ page }) => {
    const roomId = '507f191e810c19729de860ed';

    const members = Array.from({ length: 6 }, (_, i) => ({
      id: `user-${i + 1}`,
      userId: `user-${i + 1}`,
      displayName: `P${i + 1}`,
      isHost: i === 0,
    }));

    const players = Array.from({ length: 6 }, (_, i) => ({
      playerId: `user-${i + 1}`,
      alive: true,
      board: Array(10)
        .fill(null)
        .map(() => Array(10).fill(0)),
      ships: [],
      shipsRemaining: 10,
      placementComplete: true,
    }));

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        status: 'battle',
        members,
        playerCount: 6,
        gameId: 'sea_battle_v1',
      },
      session: {
        status: 'active',
        state: {
          phase: 'battle',
          players,
          playerOrder: players.map((p) => p.playerId),
          currentTurnIndex: 0,
        },
      },
    });

    // iPhone 12 landscape: 844x390
    await page.setViewportSize({ width: 844, height: 390 });
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // Verify 2 boards are visible in the same row
    const container = page.getByTestId('sea-battle-grids-container');
    const display = await container.evaluate(
      (el) => window.getComputedStyle(el).display,
    );
    expect(display).toBe('grid');

    const gridTemplateColumns = await container.evaluate(
      (el) => window.getComputedStyle(el).gridTemplateColumns,
    );
    // Should have 2 columns (e.g. "364px 364px") or at least more than 1
    const columns = gridTemplateColumns.split(' ').length;
    expect(columns).toBeGreaterThanOrEqual(2);
  });
});
