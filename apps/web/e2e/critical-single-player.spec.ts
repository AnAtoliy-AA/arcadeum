import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  mockRoomInfo,
  mockGameSocket,
  navigateTo,
  waitForRoomReady,
  closeRulesModal,
} from './fixtures/test-utils';

test.describe('Critical Single Player Mode', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (
        msg.type() === 'error' ||
        msg.type() === 'warning' ||
        msg.text().includes('session') ||
        msg.text().includes('room')
      ) {
        console.log(
          `BROWSER [${msg.type()}]: ${msg.text()}${msg.location().url ? ' @ ' + msg.location().url : ''}`,
        );
      }
    });
    await mockSession(page);
  });

  test('should allow starting single player game with bots', async ({
    page,
  }) => {
    const roomId = '507f1f77bcf86cd799439011';
    const userId = 'user-1';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        status: 'lobby',
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
        ],
      },
    });

    await mockGameSocket(page, roomId, userId, {
      handlers: {
        'games.session.start': {
          responseEvent: 'games.session.started',
          responseData: {
            success: true,
            room: {
              id: roomId,
              status: 'active',
              gameId: 'critical_v1',
              hostId: userId,
              members: [
                {
                  id: userId,
                  userId: userId,
                  displayName: 'Test User',
                  isHost: true,
                },
              ],
            },
            session: {
              id: 'session-1',
              status: 'active',
              state: {
                players: [
                  {
                    playerId: userId,
                    alive: true,
                    hand: [],
                    defuseCount: 1,
                    stash: [],
                  },
                  {
                    playerId: 'bot-1',
                    alive: true,
                    hand: [],
                    defuseCount: 1,
                    stash: [],
                  },
                ],
                deck: [],
                discardPile: [],
                currentTurnIndex: 0,
                playerOrder: [userId, 'bot-1'],
                pendingAction: null,
              },
            },
          },
        },
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    await expect(page.getByRole('heading', { name: /Critical/i })).toBeVisible({
      timeout: 15000,
    });

    const startBtn = page.getByRole('button', { name: /start with/i });
    await expect(startBtn).toBeEnabled();
    await startBtn.click();

    await closeRulesModal(page);
    await expect(page.getByRole('heading', { name: /your hand/i })).toBeVisible(
      {
        timeout: 15000,
      },
    );
  });

  test('should allow playing a move in single player mode', async ({
    page,
  }) => {
    const roomId = '507f1f77bcf86cd799439011';
    const userId = 'user-1';

    const mockState = {
      players: [
        {
          playerId: userId,
          alive: true,
          hand: ['strike', 'skip'],
          defuseCount: 1,
          stash: [],
        },
        {
          playerId: 'bot-1',
          alive: true,
          hand: ['strike'],
          defuseCount: 1,
          stash: [],
        },
      ],
      deck: Array(40).fill('strike'),
      discardPile: [],
      currentTurnIndex: 0,
      playerOrder: [userId, 'bot-1'],
      pendingAction: null,
    };

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        status: 'active',
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
        ],
      },
      session: { id: 'session-1', status: 'active', state: mockState },
    });

    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: {
        status: 'active',
        session: { id: 'session-1', status: 'active', state: mockState },
      },
      handlers: {
        'games.session.draw': {
          responseEvent: 'games.session.snapshot',
          responseData: {
            roomId,
            session: {
              id: 'session-1',
              status: 'active',
              state: {
                ...mockState,
                currentTurnIndex: 1, // Change to bot's turn
                logs: [
                  {
                    id: 'draw-log',
                    type: 'action',
                    message: 'Drawn',
                    createdAt: new Date().toISOString(),
                  },
                ],
              },
            },
          },
        },
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    await closeRulesModal(page);
    await expect(page.locator('body')).toContainText(/your turn/i);

    const drawBtn = page.getByRole('button', { name: /draw/i }).first();
    await expect(drawBtn).toBeVisible();
    await drawBtn.click();

    const showChatBtn = page.getByRole('button', { name: /show chat/i });
    if (await showChatBtn.isVisible()) {
      await showChatBtn.click();
    }

    await expect(page.getByText(/Drawn/i).first()).toBeVisible();
  });
});
