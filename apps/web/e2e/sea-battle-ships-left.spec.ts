import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import {
  mockSession,
  navigateTo,
  closeRulesModal,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  mockGameSocket,
} from './fixtures/test-utils';

test.describe('Sea Battle Ships Left', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should display Ships Left component with correct ship status', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = 'user-1';
    const opponentId = 'user-2';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Ships Left Test',
        gameId: 'sea_battle_v1',
        status: 'active',
        playerCount: 2,
        maxPlayers: 2,
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'Me', isHost: true },
          {
            id: opponentId,
            userId: opponentId,
            displayName: 'Opponent',
            isHost: false,
          },
        ],
      },
    });

    const mockState = {
      phase: 'battle',
      currentTurnIndex: 0,
      playerOrder: [userId, opponentId],
      players: [
        {
          playerId: userId,
          alive: true,
          ships: [],
          board: [],
          shipsRemaining: 10,
          placementComplete: true,
        },
        {
          playerId: opponentId,
          alive: true,
          board: [],
          shipsRemaining: 9,
          placementComplete: true,
          ships: [
            {
              id: 'cruiser-1',
              name: 'Cruiser',
              size: 3,
              cells: [],
              hits: 3,
              sunk: true,
            },
            {
              id: 'battleship-1',
              name: 'Battleship',
              size: 4,
              cells: [],
              hits: 0,
              sunk: false,
            },
          ],
        },
      ],
      logs: [],
    };

    await mockGameSocket(page, roomId, userId, {
      gameId: 'sea_battle_v1',
      roomJoinedPayload: {
        status: 'active',
        session: {
          id: 'session-1',
          roomId,
          status: 'active',
          state: mockState,
        },
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await closeRulesModal(page);

    // Wait for game to load with increased timeout
    await expect(page.getByText(/ships remaining/i).first()).toBeVisible({
      timeout: 20000,
    });

    // Check for "Your Fleet" with more flexible matching
    await expect(page.locator('body')).toContainText(/your fleet/i);

    // Check for opponent section
    await expect(page.locator('body')).toContainText(/opponent/i);

    const shipsLeftSections = page.getByText(/ships remaining/i);
    await expect(shipsLeftSections.first()).toBeVisible();
    const count = await shipsLeftSections.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // Verify Sunk Ship Visuals
    // We mocked 'cruiser-1' as sunk for opponent.

    // Strategy: Find the container that has "Opponent" (exact) but NOT "Your Fleet".
    // This isolates the Opponent's PlayerSection from the global container or user section.
    const opponentSection = page
      .locator('div')
      .filter({ has: page.getByText(/^Opponent$/i) })
      .filter({ hasNot: page.getByText(/Your Fleet/i) })
      .filter({ has: page.getByText(/ships remaining/i) }) // Ensure it's the section with ships
      .first();

    await expect(opponentSection).toBeVisible({ timeout: 15000 });

    // Within opponent section, find the Cruiser with more flexible matching
    const cruiserWrapper = opponentSection
      .locator('div[title="Cruiser"]')
      .or(opponentSection.locator('div[data-title="Cruiser"]'))
      .first();
    await expect(cruiserWrapper).toBeVisible({ timeout: 15000 });

    // Check the data-sunk attribute specifically
    const cruiserSunkAttr = await cruiserWrapper.getAttribute('data-sunk');
    expect(cruiserSunkAttr).toEqual('true');

    const battleshipWrapper = opponentSection
      .locator('div[title="Battleship"]')
      .or(opponentSection.locator('div[data-title="Battleship"]'))
      .first();
    await expect(battleshipWrapper).toBeVisible({ timeout: 15000 });

    // Check the data-sunk attribute specifically
    const battleshipSunkAttr =
      await battleshipWrapper.getAttribute('data-sunk');
    expect(battleshipSunkAttr).toEqual('false');
  });
});
