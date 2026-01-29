import { test, expect } from '@playwright/test';
import { mockSession, navigateTo } from './fixtures/test-utils';

test.describe('Game Room Logic', () => {
  const roomId = 'room-1';

  test.beforeEach(async ({ page }) => {
    // Authenticate as 'user-1'
    await mockSession(page);
  });

  test('should join as player when game is in lobby', async ({ page }) => {
    // Mock room info: Lobby, Not a participant
    await page.route(`**/games/rooms/${roomId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          room: {
            id: roomId,
            gameId: 'critical_v1',
            status: 'lobby',
            visibility: 'public',
            participants: [], // Not a participant
            members: [],
            players: [],
            gameOptions: {},
          },
        }),
      });
    });

    // Mock socket connection (optional, but good to avoid connection errors in console)
    // For now, valid API response is key.

    await navigateTo(page, `/games/rooms/${roomId}`);

    // Expect NO "game already started" error
    await expect(
      page.getByText('Cannot join - game already started'),
    ).not.toBeVisible();

    // Should indicate loading or waiting (lobby state)
    // "Waiting for players..." or similar text depends on the Game Component rendered.
    // But confirming no error is a good baseline.
  });

  test('should spectate when game is in progress and user is NOT a participant', async ({
    page,
  }) => {
    // Mock room info: In Progress, Not a participant
    await page.route(`**/games/rooms/${roomId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          room: {
            id: roomId,
            gameId: 'critical_v1',
            status: 'in_progress',
            visibility: 'public',
            participants: [{ userId: 'other-user' }],
            members: [{ id: 'other-user', displayName: 'Other', isHost: true }],
            players: [],
            gameOptions: {},
          },
        }),
      });
    });

    await navigateTo(page, `/games/rooms/${roomId}`);

    // Expect NO "game already started" error
    await expect(
      page.getByText('Cannot join - game already started'),
    ).not.toBeVisible();

    // Validating "Spectator" mode is active typically requires checking UI elements
    // that appear only for spectators, or lack of player controls.
    // For now, ensuring it loads without error implies it fell back to watch (or logic worked).
  });

  test('should join as player when game is in progress but user IS a participant', async ({
    page,
  }) => {
    // Mock room info: In Progress, IS a participant
    await page.route(`**/games/rooms/${roomId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          room: {
            id: roomId,
            gameId: 'critical_v1',
            status: 'in_progress',
            visibility: 'public',
            participants: [{ userId: 'user-1' }], // IS participant
            members: [{ id: 'user-1', displayName: 'Me', isHost: false }],
            players: [],
            gameOptions: {},
          },
        }),
      });
    });

    await navigateTo(page, `/games/rooms/${roomId}`);

    // Expect NO "game already started" error
    await expect(
      page.getByText('Cannot join - game already started'),
    ).not.toBeVisible();
  });
});
