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

test.describe('Hearts gameplay and mobile layout', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('renders fanned mobile hand and allows card pass selection', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const roomId = MOCK_OBJECT_ID;
    const userId = '507f191e810c19729de860ea';
    const sessionId = '507f191e810c19729de860f2';

    const mockHand = [
      '2C',
      '3C',
      '4C',
      '5C',
      '6C',
      '7C',
      '8C',
      '9C',
      '10C',
      'JC',
      'QC',
      'KC',
      'AC',
    ];

    const mockState = {
      phase: 'passing',
      options: { passingEnabled: true, targetScore: 100 },
      handNumber: 0,
      passDirection: 'left',
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
      pendingPasses: {},
      scores: { [userId]: 0, 'bot-1': 0, 'bot-2': 0, 'bot-3': 0 },
      handScores: { [userId]: 0, 'bot-1': 0, 'bot-2': 0, 'bot-3': 0 },
      currentTrick: { plays: [], leadSuit: null },
      heartsBroken: false,
      winnerIds: null,
      winType: null,
      isDraw: false,
      logs: [],
    };

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Hearts Test Room',
        gameId: 'hearts_v1',
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
        name: 'Hearts Test Room',
        gameId: 'hearts_v1',
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

    const board = page.locator('[data-testid="hearts-board"]');
    await expect(board).toBeVisible();

    const firstCard = page.locator('[data-testid="hearts-card-2C"]');
    await expect(firstCard).toBeVisible();

    const box = await firstCard.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(40);
    }

    const passBtn = page.locator('[data-testid="hearts-pass-button"]');
    await expect(passBtn).toBeVisible();
    await expect(passBtn).toBeDisabled();

    await page.locator('[data-testid="hearts-card-3C"]').click({ force: true });
    await page.locator('[data-testid="hearts-card-4C"]').click({ force: true });
    await page.locator('[data-testid="hearts-card-5C"]').click({ force: true });

    await expect(passBtn).toBeEnabled();

    const seat = page.locator(`[data-testid="hearts-seat-${userId}"]`);
    await expect(seat).toBeVisible();
  });
});
