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
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`BROWSER [${msg.type()}]: ${msg.text()}`);
      }
    });
    await mockSession(page);
  });

  test('should display victory modal when player wins', async ({ page }) => {
    const roomId = '500000000000000000000001';

    const roomData = {
      id: roomId,
      status: 'completed' as const,
      members: [
        { id: 'user-1', displayName: 'Winner', isHost: true },
        { id: 'user-2', displayName: 'Loser', isHost: false },
      ],
      gameOptions: { cardVariant: 'default' },
    };

    const sessionData = {
      sessionId: 'sess-1',
      roomId: roomId,
      userId: 'user-1',
      status: 'completed' as const,
      state: {
        players: [
          { playerId: 'user-1', alive: true, hand: [], stash: [] },
          { playerId: 'user-2', alive: false, hand: [], stash: [] },
        ],
        playerOrder: ['user-1', 'user-2'],
        currentTurnIndex: 0,
        deck: [],
        discardPile: [],
        logs: [],
        winnerId: 'user-1',
      },
    };

    await mockRoomInfo(page, {
      room: roomData,
      session: sessionData,
    });

    await mockGameSocket(page, roomId, 'user-1', {
      roomJoinedPayload: {
        ...roomData,
        session: sessionData,
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    const victoryHeading = page.getByTestId('game-result-title');
    await expect(victoryHeading).toBeVisible({ timeout: 30000 });
    await expect(victoryHeading).toContainText(/Victory|🏆/i);

    const rematchBtn = page.getByRole('button', {
      name: /Play Again|Rematch/i,
    });
    await expect(rematchBtn.first()).toBeVisible({ timeout: 15000 });

    const homeBtn = page.getByRole('link', { name: /Back to Home/i }).first();
    await expect(homeBtn).toBeVisible();
    await homeBtn.click();
  });

  test('should display defeat modal when player loses', async ({ page }) => {
    const roomId = '500000000000000000000002';

    const roomData = {
      id: roomId,
      hostId: 'user-2',
      status: 'completed' as const,
      members: [
        { id: 'user-1', displayName: 'Loser', isHost: false },
        { id: 'user-2', displayName: 'Winner', isHost: true },
      ],
      gameOptions: { cardVariant: 'default' },
    };

    const sessionData = {
      sessionId: 'sess-1',
      roomId: roomId,
      userId: 'user-1',
      status: 'completed' as const,
      state: {
        players: [
          { playerId: 'user-1', alive: false, hand: [], stash: [] },
          { playerId: 'user-2', alive: true, hand: [], stash: [] },
        ],
        playerOrder: ['user-1', 'user-2'],
        currentTurnIndex: 1,
        deck: [],
        discardPile: [],
        logs: [],
        winnerId: 'user-2',
      },
    };

    await mockRoomInfo(page, {
      room: roomData,
      session: sessionData,
    });

    await mockGameSocket(page, roomId, 'user-1', {
      roomJoinedPayload: {
        ...roomData,
        session: sessionData,
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    const defeatHeading = page.getByTestId('game-result-title');
    await expect(defeatHeading).toBeVisible({ timeout: 30000 });
    await expect(defeatHeading).toContainText(/Game Over|💀/i);

    const homeBtn = page.getByRole('link', { name: /Back to Home/i }).first();
    await expect(homeBtn).toBeVisible();
    await homeBtn.click();

    await expect(
      page.getByRole('button', { name: /Play Again/i }),
    ).not.toBeVisible();
  });
});
