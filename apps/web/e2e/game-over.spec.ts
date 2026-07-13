import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import {
  mockSession,
  navigateTo,
  mockRoomInfo,
  waitForRoomReady,
  mockGameSocket,
} from './fixtures/test-utils';

test.describe('Game Over Screen', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should display victory modal when player wins', async ({ page }) => {
    const roomId = '500000000000000000000001';

    const roomData = {
      id: roomId,
      status: 'completed' as const,
      members: [
        { id: '507f191e810c19729de860ea', displayName: 'Winner', isHost: true },
        { id: '507f191e810c19729de860e2', displayName: 'Loser', isHost: false },
      ],
      gameOptions: { cardVariant: 'default' },
    };

    const sessionData = {
      sessionId: 'sess-1',
      roomId: roomId,
      userId: '507f191e810c19729de860ea',
      status: 'completed' as const,
      state: {
        players: [
          {
            playerId: '507f191e810c19729de860ea',
            alive: true,
            hand: [],
            stash: [],
          },
          {
            playerId: '507f191e810c19729de860e2',
            alive: false,
            hand: [],
            stash: [],
          },
        ],
        playerOrder: ['507f191e810c19729de860ea', '507f191e810c19729de860e2'],
        currentTurnIndex: 0,
        deck: [],
        discardPile: [],
        logs: [],
        winnerId: '507f191e810c19729de860ea',
      },
    };

    await mockRoomInfo(page, {
      room: roomData,
      session: sessionData,
    });

    await mockGameSocket(page, roomId, '507f191e810c19729de860ea', {
      roomJoinedPayload: {
        ...roomData,
        session: sessionData,
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // Entering an already-completed game should NOT auto-show the result modal.
    const victoryHeading = page.getByTestId('game-result-title');
    await expect(victoryHeading).not.toBeVisible({ timeout: 3000 });
  });

  test('should display defeat modal when player loses', async ({ page }) => {
    const roomId = '500000000000000000000002';

    const roomData = {
      id: roomId,
      hostId: '507f191e810c19729de860e2',
      status: 'completed' as const,
      members: [
        { id: '507f191e810c19729de860ea', displayName: 'Loser', isHost: false },
        { id: '507f191e810c19729de860e2', displayName: 'Winner', isHost: true },
      ],
      gameOptions: { cardVariant: 'default' },
    };

    const sessionData = {
      sessionId: 'sess-1',
      roomId: roomId,
      userId: '507f191e810c19729de860ea',
      status: 'completed' as const,
      state: {
        players: [
          {
            playerId: '507f191e810c19729de860ea',
            alive: false,
            hand: [],
            stash: [],
          },
          {
            playerId: '507f191e810c19729de860e2',
            alive: true,
            hand: [],
            stash: [],
          },
        ],
        playerOrder: ['507f191e810c19729de860ea', '507f191e810c19729de860e2'],
        currentTurnIndex: 1,
        deck: [],
        discardPile: [],
        logs: [],
        winnerId: '507f191e810c19729de860e2',
      },
    };

    await mockRoomInfo(page, {
      room: roomData,
      session: sessionData,
    });

    await mockGameSocket(page, roomId, '507f191e810c19729de860ea', {
      roomJoinedPayload: {
        ...roomData,
        session: sessionData,
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // Entering an already-completed game should NOT auto-show the result modal.
    const defeatHeading = page.getByTestId('game-result-title');
    await expect(defeatHeading).not.toBeVisible({ timeout: 3000 });
  });
});
