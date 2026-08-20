import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  navigateTo,
  closeRulesModal,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  mockGameSocket,
  waitForRoomReady,
} from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

test.describe('Themed Game Result Modal', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('displays themed victory screen with celebration layer upon winning', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';
    const sessionId = '507f191e810c19729de860f1';

    const winningState = {
      phase: 'playing',
      options: { variant: 'cyberpunk', stackingEnabled: true },
      players: [
        {
          playerId: userId,
          alive: true,
          hand: [{ id: 'r5', color: 'R', kind: 'NUMBER', value: 5 }],
        },
        {
          playerId: 'bot-1',
          alive: true,
          hand: new Array(7).fill({}),
        },
      ],
      playerOrder: [userId, 'bot-1'],
      currentTurnIndex: 0,
      direction: 1,
      drawPile: [],
      discardPile: [{ id: 'top', color: 'R', kind: 'NUMBER', value: 9 }],
      topCard: { id: 'top', color: 'R', kind: 'NUMBER', value: 9 },
      activeColor: 'R',
      pendingDraw: 0,
      pendingStackKind: null,
      pendingAction: 'none',
      winnerId: null,
      logs: [],
    };

    const gameOverState = {
      ...winningState,
      phase: 'game_over',
      winnerId: userId,
      players: [
        { ...winningState.players[0], hand: [] },
        winningState.players[1],
      ],
      topCard: { id: 'r5', color: 'R', kind: 'NUMBER', value: 5 },
      discardPile: [
        ...winningState.discardPile,
        { id: 'r5', color: 'R', kind: 'NUMBER', value: 5 },
      ],
    };

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Themed Win Test',
        gameId: 'cascade_v1',
        maxPlayers: 10,
        hostId: userId,
        status: 'in_progress',
        gameOptions: { variant: 'cyberpunk', theme: 'cyberpunk' },
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
        ],
      },
      session: {
        id: sessionId,
        status: 'active',
        state: winningState,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: {
        name: 'Themed Win Test',
        gameId: 'cascade_v1',
        maxPlayers: 10,
        status: 'in_progress',
        hostId: userId,
        gameOptions: { variant: 'cyberpunk', theme: 'cyberpunk' },
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
        ],
        session: {
          id: sessionId,
          status: 'active',
          state: winningState,
        },
      },
      handlers: {
        'cascade.session.play_card': {
          responseEvent: 'games.session.snapshot',
          responseData: {
            roomId,
            session: {
              id: sessionId,
              status: 'completed',
              state: gameOverState,
            },
          },
        },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);
    await closeRulesModal(page);

    const card = page.getByRole('button', { name: /red 5/i }).first();
    await expect(card).toBeVisible();
    await card.dispatchEvent('click');

    const resultModal = page.getByTestId('game-result-modal');
    await expect(resultModal).toBeVisible();
    await expect(resultModal).toHaveAttribute('data-theme', 'cyberpunk');
    await expect(resultModal).toHaveAttribute('data-tone', 'victory');

    const celebration = page.getByTestId('victory-celebration');
    await expect(celebration).toBeVisible();
    await expect(celebration).toHaveAttribute('data-theme', 'cyberpunk');
  });
});
