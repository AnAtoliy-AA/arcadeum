import { expect } from '@playwright/test';
import {
  test,
  checkNoBackendErrors,
  waitForRoomReady,
  MOCK_OBJECT_ID,
  mockGameSocket,
  mockAllOnPage,
  handleRoute,
} from './fixtures/test-utils';

test.describe('Anonymous Play', () => {
  test.setTimeout(60000);

  const anonymousId = 'anon_test_user_123';

  test.beforeEach(async ({ page }) => {
    await page.addInitScript((id) => {
      localStorage.setItem('aico_anon_id', id);
    }, anonymousId);

    await page.route('**/games/rooms', async (route) => {
      const method = route.request().method();
      if (method === 'POST') {
        await handleRoute(route, {
          room: {
            id: MOCK_OBJECT_ID,
            name: 'Anonymous Bot Game',
            gameId: 'critical_v1',
            status: 'lobby',
            visibility: 'public',
            members: [
              {
                id: anonymousId,
                userId: anonymousId,
                displayName: 'Guest',
                isHost: true,
              },
            ],
            hostId: anonymousId,
          },
        });
      } else if (method === 'OPTIONS') {
        await handleRoute(route, null);
      } else {
        await route.continue();
      }
    });

    await page.route('**/games/room-info', async (route) => {
      const method = route.request().method();
      if (method === 'POST') {
        await handleRoute(route, {
          room: {
            id: MOCK_OBJECT_ID,
            name: 'Anonymous Bot Game',
            gameId: 'critical_v1',
            status: 'lobby',
            visibility: 'public',
            members: [
              {
                id: anonymousId,
                userId: anonymousId,
                displayName: 'Guest',
                isHost: true,
              },
            ],
            hostId: anonymousId,
          },
          session: null,
        });
      } else if (method === 'OPTIONS') {
        await handleRoute(route, null);
      } else {
        await route.continue();
      }
    });

    await page.route('**/games/rooms/delete', async (route) => {
      await handleRoute(route, { success: true });
    });

    await mockGameSocket(page, MOCK_OBJECT_ID, anonymousId);
  });

  test.afterEach(async () => {
    checkNoBackendErrors();
  });

  test('should allow creating a room without login', async ({ page }) => {
    await page.goto('/games/create?gameId=critical_v1', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await expect(page).toHaveURL(/\/games\/create/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /create/i })).toBeVisible();

    await page
      .getByLabel('Room Name', { exact: false })
      .fill('Anonymous Bot Game');
    await page.waitForTimeout(1000); // Allow state to settle
    await page.getByTestId('create-room-button').click({ force: true });

    await expect(page).toHaveURL(new RegExp(`/games/rooms/${MOCK_OBJECT_ID}`), {
      timeout: 30000,
    });

    await waitForRoomReady(page);

    await expect(
      page.getByTitle(/Go back to lobby|Exit Room/i).first(),
    ).toBeVisible({
      timeout: 30000,
    });

    await expect(
      page.getByRole('button', { name: /Start Game|Start with/i }),
    ).toBeVisible();
  });

  const hostId = 'anon-host-id';
  const joinerId = 'anon-joiner-id';

  test('should allow joining a private room as anonymous via invite link', async ({
    context,
    page,
  }) => {
    // Basic setup for the first page (host)
    await page.addInitScript((id) => {
      window.isPlaywright = true;
      localStorage.setItem('aico_anon_id', id);
    }, hostId);

    // Mock games/rooms to return a specific ID for the created room
    await page.route('**/games/rooms', async (route) => {
      const method = route.request().method();
      if (method === 'POST') {
        const payload = {
          success: true,
          room: {
            id: MOCK_OBJECT_ID,
            name: 'Private Room',
            gameId: 'critical_v1',
            status: 'lobby',
            visibility: 'private',
            members: [
              { id: hostId, userId: hostId, displayName: 'Host', isHost: true },
            ],
            hostId: hostId,
          },
        };
        await handleRoute(route, payload);
      } else if (method === 'OPTIONS') {
        await handleRoute(route, null);
      } else {
        await route.continue();
      }
    });

    await page.goto('/games/create', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await expect(page.getByRole('heading', { name: /create/i })).toBeVisible();

    await page
      .getByLabel('Room Name', { exact: false })
      .fill('Private Link Test');

    const visibilityBtn = page.getByLabel(/Public room/i);
    await visibilityBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500); // Wait for potential layout shifts
    await visibilityBtn.click({ force: true });

    // In Firefox, transition might take a moment
    await expect(page.getByLabel(/Private room/i)).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('button', { name: 'Create Room' }).click();

    await expect(page).toHaveURL(new RegExp(`/games/rooms/${MOCK_OBJECT_ID}`), {
      timeout: 25000,
    });
    const inviteUrl = page.url();

    // Create a NEW context and page for the second player to ensure complete isolation
    // and prevent shared resource hangs that occur when multiple pages in one context
    // are navigating simultaneously to the same dev server.
    const joinerContext = await context.browser()!.newContext({
      viewport: page.viewportSize() ?? undefined,
    });
    const newPage = await joinerContext.newPage();

    // Ensure the new page has a distinct anonymous user ID
    await newPage.addInitScript((id) => {
      window.isPlaywright = true;
      localStorage.setItem('aico_anon_id', id);
    }, joinerId);

    // Thoroughly mock room info and common routes for the new page
    await newPage.route('**/games/room-info', async (route) => {
      await handleRoute(route, {
        room: {
          id: MOCK_OBJECT_ID,
          name: 'Private Link Test',
          gameId: 'critical_v1',
          status: 'lobby',
          visibility: 'private',
          members: [
            { id: hostId, userId: hostId, displayName: 'Host', isHost: true },
            {
              id: joinerId,
              userId: joinerId,
              displayName: 'Guest',
              isHost: false,
            },
          ],
          hostId: hostId,
        },
        session: null,
      });
    });

    await newPage.route('**/auth/me', async (route) => {
      await handleRoute(route, { user: null });
    });

    await newPage.route('**/auth/blocked', async (route) => {
      await handleRoute(route, []);
    });

    await mockAllOnPage(newPage);

    await mockGameSocket(newPage, MOCK_OBJECT_ID, joinerId, {
      roomJoinedPayload: {
        members: [
          { id: hostId, userId: hostId, displayName: 'Host', isHost: true },
          {
            id: joinerId,
            userId: joinerId,
            displayName: 'Guest',
            isHost: false,
          },
        ],
        hostId: hostId,
      },
    });

    // Navigation with 'domcontentloaded' and generous timeout for CI stability.
    // Serial mode is enabled for this describe block to prevent resource contention
    // on the dev server during multi-browser runs.
    await newPage.goto(inviteUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await waitForRoomReady(newPage);

    await expect(
      newPage.getByRole('button', { name: /Exit|Leave/i }).first(),
    ).toBeVisible({
      timeout: 30000,
    });

    await expect(
      newPage
        .getByText('Waiting for host to start the game')
        .or(newPage.getByText('Players in Lobby'))
        .first(),
    ).toBeVisible();
  });
});
