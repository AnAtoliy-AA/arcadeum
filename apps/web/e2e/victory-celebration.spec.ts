import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import {
  mockSession,
  navigateTo,
  mockRoomInfo,
  waitForRoomReady,
  mockGameSocket,
} from './fixtures/test-utils';

// The celebration FX layer (gold confetti / sparkles / bloom) is rendered
// inside the shared GameResultModal on a win. This verifies it actually mounts
// for the winner — the visible "wow" moment.
test.describe('Victory celebration', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('renders the celebration FX layer on a win', async ({ page }) => {
    const roomId = '500000000000000000000051';
    const winnerId = '507f191e810c19729de860ea';

    const roomData = {
      id: roomId,
      status: 'completed' as const,
      members: [
        { id: winnerId, displayName: 'Winner', isHost: true },
        { id: '507f191e810c19729de860e2', displayName: 'Loser', isHost: false },
      ],
      gameOptions: { cardVariant: 'default' },
    };

    const sessionData = {
      sessionId: 'sess-celebrate',
      roomId,
      userId: winnerId,
      status: 'completed' as const,
      state: {
        players: [
          { playerId: winnerId, alive: true, hand: [], stash: [] },
          {
            playerId: '507f191e810c19729de860e2',
            alive: false,
            hand: [],
            stash: [],
          },
        ],
        playerOrder: [winnerId, '507f191e810c19729de860e2'],
        currentTurnIndex: 0,
        deck: [],
        discardPile: [],
        logs: [],
        winnerId,
      },
    };

    await mockRoomInfo(page, { room: roomData, session: sessionData });
    await mockGameSocket(page, roomId, winnerId, {
      roomJoinedPayload: { ...roomData, session: sessionData },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // Result modal shows victory…
    await expect(page.getByTestId('game-result-title')).toContainText(
      /Victory|🏆|won|победа/i,
    );
    // …and the celebration FX layer is mounted.
    await expect(page.getByTestId('victory-celebration')).toBeVisible();
  });
});
