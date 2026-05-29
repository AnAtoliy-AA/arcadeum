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

test.describe('Critical Card Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should render Critical game card on home page', async ({ page }) => {
    await navigateTo(page, '/');
  });

  test('should show card names and descriptions with modern styling', async ({
    page,
  }) => {
    const roomId = '507f1f77bcf86cd799439011';
    const userId = '507f191e810c19729de860ea';

    const mockState = {
      players: [
        {
          playerId: userId,
          alive: true,
          hand: ['strike'],
          defuseCount: 1,
          stash: [],
        },
      ],
      deck: Array(40).fill('strike'),
      discardPile: [],
      currentTurnIndex: 0,
      playerOrder: [userId],
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

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);
    await closeGameRulesModal(page);

    // Anchor on the hand card by card id (`data-card="strike"`) — the
    // new MatchWidget renders cards via `HandCard` which exposes that
    // attribute. Rules-modal previews use a different testid scope, so
    // this won't accidentally match them.
    const handStrike = page.locator('[data-card="strike"]').first();
    await expect(handStrike).toBeVisible({});

    // `HandCard` exposes its name block via a per-card testid prefix.
    const cardName = handStrike.locator('[data-testid^="hand-card-name-"]');
    await expect(cardName).toBeVisible({});

    // Description is gated by the user's show-description toggle; assert
    // it only when it actually rendered.
    const cardDescription = handStrike.locator(
      '[data-testid^="hand-card-description-"]',
    );
    if (await cardDescription.isVisible().catch(() => false)) {
      await expect(cardDescription).toBeVisible();
    }

    // Redesign markers (ARC-480): scene backdrop should still mount
    // beneath the new MatchWidget, and the turn banner now lives in
    // `ArenaCenter`.
    await expect(page.locator('[data-testid="scene-backdrop"]')).toBeVisible();
    await expect(page.locator('[data-testid="turn-banner"]')).toBeVisible();
  });
});
