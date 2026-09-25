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

test.describe('Critical Combo Modal', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('opens combo modal on pair play and allows selecting a blind card', async ({
    page,
  }) => {
    const roomId = '507f1f77bcf86cd799439022';
    const userId = '507f191e810c19729de860ea';
    const opponentId = '507f191e810c19729de860b1';

    const mockState = {
      players: [
        {
          playerId: userId,
          alive: true,
          hand: ['cancel', 'cancel', 'strike'],
          defuseCount: 1,
          stash: [],
        },
        {
          playerId: opponentId,
          alive: true,
          hand: ['strike', 'evade'],
          defuseCount: 1,
          stash: [],
        },
      ],
      deck: Array(30).fill('strike'),
      discardPile: [],
      currentTurnIndex: 0,
      playerOrder: [userId, opponentId],
      pendingAction: null,
      pendingFavor: null,
      pendingDefuse: null,
      allowActionCardCombos: true,
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
        id: '507f191e810c19729de860f2',
        status: 'active',
        state: mockState,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: {
        status: 'active',
        session: {
          id: '507f191e810c19729de860f2',
          status: 'active',
          state: mockState,
        },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);
    await closeGameRulesModal(page);

    const cancelCard = page.getByTestId('hand-card-cancel');
    await expect(cancelCard).toBeVisible();
    await cancelCard.click();
    await expect(cancelCard).toHaveAttribute('data-selected-count', '1');
    const incButton = page.getByTestId('stack-inc-cancel');
    await expect(incButton).toBeVisible();
    await incButton.click();
    await expect(cancelCard).toHaveAttribute('data-selected-count', '2');

    const playButton = page
      .getByTestId('hand-rail-play')
      .or(page.getByTestId('mobile-hand-bar-play'));
    await expect(playButton).toBeVisible();
    await expect(playButton).toBeEnabled();
    await playButton.click();

    const modal = page.getByTestId('combo-modal');
    await expect(modal).toBeVisible();

    const blindPicker = page.getByTestId('blind-card-picker');
    await expect(blindPicker).toBeVisible();

    const confirmButton = page.getByTestId('combo-confirm-button');
    await expect(confirmButton).toBeDisabled();

    const firstBlindCard = page.getByTestId('blind-card-0');
    await expect(firstBlindCard).toBeVisible();
    await expect(firstBlindCard).toContainText('#1');
    await firstBlindCard.click();

    await expect(firstBlindCard).toHaveAttribute('aria-pressed', 'true');
    await expect(confirmButton).toBeEnabled();

    const closeButton = page.getByTestId('combo-modal-close-button');
    await expect(closeButton).toBeVisible();
  });
});
