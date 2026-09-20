import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  mockRoomInfo,
  mockGameSocket,
  navigateTo,
  waitForRoomReady,
  closeGameRulesModal,
} from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

test.describe('Critical Give Favor Modal', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('renders give favor modal with playable cards and actions in mobile viewport', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const roomId = '507f1f77bcf86cd799439011';
    const userId = '507f191e810c19729de860ea';
    const opponentId = '507f191e810c19729de860b1';

    const mockState = {
      players: [
        {
          playerId: userId,
          alive: true,
          hand: ['neutralizer', 'evade', 'strike'],
          defuseCount: 1,
          stash: [],
        },
        {
          playerId: opponentId,
          alive: true,
          hand: ['strike'],
          defuseCount: 1,
          stash: [],
        },
      ],
      deck: Array(30).fill('strike'),
      discardPile: [],
      currentTurnIndex: 1,
      playerOrder: [userId, opponentId],
      pendingAction: null,
      pendingFavor: {
        targetId: userId,
        requesterId: opponentId,
      },
    };

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        status: 'active',
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
          {
            id: opponentId,
            userId: opponentId,
            displayName: 'Opponent Bot',
            isHost: false,
          },
        ],
      },
      session: {
        id: '507f191e810c19729de860f1',
        status: 'active',
        state: mockState,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: {
        status: 'active',
        session: {
          id: '507f191e810c19729de860f1',
          status: 'active',
          state: mockState,
        },
      },
      handlers: {
        'games.critical.give_favor': {
          responseEvent: 'games.session.snapshot',
          responseData: {
            roomId,
            session: {
              id: '507f191e810c19729de860f1',
              status: 'active',
              state: {
                ...mockState,
                pendingFavor: null,
              },
            },
          },
        },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);
    await closeGameRulesModal(page);

    const modal = page.getByTestId('give-favor-modal');
    await expect(modal).toBeVisible();

    const confirmButton = page.getByTestId('give-favor-confirm');
    const cancelButton = page.getByTestId('give-favor-cancel');

    await expect(confirmButton).toBeVisible();
    await expect(cancelButton).toBeVisible();
    await expect(confirmButton).toBeDisabled();

    const firstCard = page.getByTestId('give-favor-card-0');
    await expect(firstCard).toBeVisible();
    const box = await firstCard.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThan(60);
    }

    await firstCard.click();
    await expect(confirmButton).toBeEnabled();

    await cancelButton.click();
    await expect(modal).toBeHidden();
  });

  test('keeps action buttons reachable in mobile landscape viewport', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 844, height: 390 });

    const roomId = '507f1f77bcf86cd799439011';
    const userId = '507f191e810c19729de860ea';
    const opponentId = '507f191e810c19729de860b1';

    const mockState = {
      players: [
        {
          playerId: userId,
          alive: true,
          hand: ['neutralizer', 'evade', 'strike', 'insight', 'reorder'],
          defuseCount: 1,
          stash: [],
        },
        {
          playerId: opponentId,
          alive: true,
          hand: ['strike'],
          defuseCount: 1,
          stash: [],
        },
      ],
      deck: Array(30).fill('strike'),
      discardPile: [],
      currentTurnIndex: 1,
      playerOrder: [userId, opponentId],
      pendingAction: null,
      pendingFavor: {
        targetId: userId,
        requesterId: opponentId,
      },
    };

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        status: 'active',
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Test User', isHost: true },
          {
            id: opponentId,
            userId: opponentId,
            displayName: 'Opponent Bot',
            isHost: false,
          },
        ],
      },
      session: {
        id: '507f191e810c19729de860f1',
        status: 'active',
        state: mockState,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: {
        status: 'active',
        session: {
          id: '507f191e810c19729de860f1',
          status: 'active',
          state: mockState,
        },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);
    await closeGameRulesModal(page);

    const modal = page.getByTestId('give-favor-modal');
    await expect(modal).toBeVisible();

    const confirmButton = page.getByTestId('give-favor-confirm');
    const cancelButton = page.getByTestId('give-favor-cancel');

    await expect(confirmButton).toBeVisible();
    await expect(cancelButton).toBeVisible();
  });
});
