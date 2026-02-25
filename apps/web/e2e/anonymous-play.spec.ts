import { expect } from '@playwright/test';
import {
  test,
  checkNoBackendErrors,
  waitForRoomReady,
  MOCK_OBJECT_ID,
  mockGameSocket,
  mockAllOnPage,
} from './fixtures/test-utils';

test.describe('Anonymous Play', () => {
  test.setTimeout(60000);

  const anonymousId = 'anon_test_user_123';

  test.beforeEach(async ({ page }) => {
    await page.addInitScript((id) => {
      localStorage.setItem('aico_anon_id', id);
    }, anonymousId);

    await page.route('**/games/rooms', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
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
        }),
      });
    });

    await page.route('**/games/room-info', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
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
        }),
      });
    });

    await page.route('**/games/rooms/delete', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await mockGameSocket(page, MOCK_OBJECT_ID, anonymousId);
  });

  test.afterEach(async () => {
    checkNoBackendErrors();
  });

  test('should allow creating a room without login', async ({ page }) => {
    await page.goto('/games/create?gameId=critical_v1');

    await expect(page).toHaveURL(/\/games\/create/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /create/i })).toBeVisible();

    await page
      .getByLabel('Room Name', { exact: false })
      .fill('Anonymous Bot Game');
    await page.getByRole('button', { name: 'Create Room' }).click();

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

  test('should allow joining a private room as anonymous via invite link', async ({
    context,
    page,
  }) => {
    await page.goto('/games/create');
    await expect(page.getByRole('heading', { name: /create/i })).toBeVisible();

    await page
      .getByLabel('Room Name', { exact: false })
      .fill('Private Link Test');

    const visibilityBtn = page.getByLabel(/Public room/i);
    await expect(visibilityBtn).toBeVisible();
    await visibilityBtn.click({ force: true });
    await expect(page.getByLabel(/Private room/i)).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('button', { name: 'Create Room' }).click();

    await expect(page).toHaveURL(new RegExp(`/games/rooms/${MOCK_OBJECT_ID}`), {
      timeout: 25000,
    });
    const inviteUrl = page.url();

    const newPage = await context.newPage();
    await mockAllOnPage(newPage);

    await newPage.route('**/games/room-info', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          room: {
            id: MOCK_OBJECT_ID,
            name: 'Private Link Test',
            gameId: 'critical_v1',
            status: 'lobby',
            visibility: 'private',
            members: [
              {
                id: 'host-1',
                userId: 'host-1',
                displayName: 'Host',
                isHost: true,
              },
              {
                id: anonymousId,
                userId: anonymousId,
                displayName: 'Guest',
                isHost: false,
              },
            ],
            hostId: 'host-1',
          },
          session: null,
        }),
      });
    });

    await mockGameSocket(newPage, MOCK_OBJECT_ID, anonymousId);

    await newPage.goto(inviteUrl);
    await waitForRoomReady(newPage);

    await expect(
      newPage.getByRole('button', { name: /Exit/i }).first(),
    ).toBeVisible({
      timeout: 15000,
    });

    await expect(
      newPage
        .getByText('Waiting for host to start the game')
        .or(newPage.getByText('Players in Lobby'))
        .first(),
    ).toBeVisible();
  });
});
