import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  mockRoomInfo,
  mockGameSocket,
  navigateTo,
  waitForRoomReady,
  closeGameRulesModal,
  MOCK_OBJECT_ID,
} from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

test.describe('Spades gameplay and mobile layout', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('renders fanned mobile hand and allows bidding', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';
    const sessionId = '507f191e810c19729de860f3';

    const mockHand = [
      '2S',
      '3S',
      '4S',
      '5S',
      '6S',
      '7S',
      '8S',
      '9S',
      '10S',
      'JS',
      'QS',
      'KS',
      'AS',
    ];

    const mockState = {
      phase: 'bidding',
      options: { nilEnabled: true, targetScore: 250 },
      handNumber: 0,
      players: [
        { playerId: userId },
        { playerId: 'bot-1' },
        { playerId: 'bot-2' },
        { playerId: 'bot-3' },
      ],
      playerOrder: [userId, 'bot-1', 'bot-2', 'bot-3'],
      currentTurnIndex: 0,
      hands: {
        [userId]: mockHand,
        'bot-1': mockHand,
        'bot-2': mockHand,
        'bot-3': mockHand,
      },
      taken: {},
      bids: { [userId]: null, 'bot-1': null, 'bot-2': null, 'bot-3': null },
      scores: { [userId]: 0, 'bot-1': 0, 'bot-2': 0, 'bot-3': 0 },
      bags: { [userId]: 0, 'bot-1': 0 },
      currentTrick: { plays: [], leadSuit: null },
      spadesBroken: false,
      winnerIds: null,
      isDraw: false,
      logs: [],
    };

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Spades Test Room',
        gameId: 'spades_v1',
        status: 'in_progress',
        maxPlayers: 4,
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Player 1', isHost: true },
          { id: 'bot-1', userId: 'bot-1', displayName: 'Bot Alpha' },
          { id: 'bot-2', userId: 'bot-2', displayName: 'Bot Beta' },
          { id: 'bot-3', userId: 'bot-3', displayName: 'Bot Gamma' },
        ],
      },
      session: {
        id: sessionId,
        status: 'active',
        state: mockState,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: {
        name: 'Spades Test Room',
        gameId: 'spades_v1',
        status: 'in_progress',
        maxPlayers: 4,
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Player 1', isHost: true },
          { id: 'bot-1', userId: 'bot-1', displayName: 'Bot Alpha' },
          { id: 'bot-2', userId: 'bot-2', displayName: 'Bot Beta' },
          { id: 'bot-3', userId: 'bot-3', displayName: 'Bot Gamma' },
        ],
        session: {
          id: sessionId,
          status: 'active',
          state: mockState,
        },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);
    await closeGameRulesModal(page);

    const board = page.locator('[data-testid="spades-board"]');
    await expect(board).toBeVisible();

    const firstCard = page.locator('[data-testid="spades-card-2S"]');
    await expect(firstCard).toBeVisible();

    const box = await firstCard.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(40);
    }

    const bid3Btn = page.locator('[data-testid="spades-bid-3"]');
    await expect(bid3Btn).toBeVisible();
    await bid3Btn.click({ force: true });

    const confirmBtn = page.locator('[data-testid="spades-confirm-bid"]');
    await expect(confirmBtn).toBeVisible();
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click({ force: true });

    const seat = page.locator(`[data-testid="spades-seat-${userId}"]`);
    await expect(seat).toBeVisible();
  });
});
