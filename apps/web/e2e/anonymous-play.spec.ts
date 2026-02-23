import { test, expect } from '@playwright/test';
import { checkNoBackendErrors } from './fixtures/test-utils';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

test.describe('Anonymous Play', () => {
  let createdRoomId: string | null = null;
  let anonymousId: string | null = null;

  test.afterEach(async ({ request }) => {
    if (createdRoomId && anonymousId) {
      await request.post(`${API_BASE}/games/rooms/delete`, {
        headers: { 'x-anonymous-id': anonymousId },
        data: { roomId: createdRoomId },
      });
    }
    createdRoomId = null;
    anonymousId = null;
    checkNoBackendErrors();
  });

  test('should allow creating a room without login', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Play with Bots' }).click();

    await expect(page).toHaveURL(/\/games\/create/, { timeout: 15000 });

    // Wait for the page to be ready and hydrated
    await expect(page.getByRole('heading', { name: /create/i })).toBeVisible();
    await page.waitForTimeout(1000); // Buffer for hydration

    await page
      .getByLabel('Room Name', { exact: false })
      .fill('Anonymous Bot Game');

    await page.getByRole('button', { name: 'Create Room' }).click();

    await expect(page).toHaveURL(/\/games\/rooms\//, { timeout: 20000 });

    const url = page.url();
    const match = url.match(/\/games\/rooms\/([^/?]+)/);
    createdRoomId = match?.[1] ?? null;

    anonymousId = await page.evaluate(() =>
      localStorage.getItem('aico_anon_id'),
    );

    try {
      await expect(page.getByText('Joining...')).not.toBeVisible({
        timeout: 5000,
      });
    } catch {
      // Ignore
    }

    await expect(page.getByRole('button', { name: /Exit/i })).toBeVisible({
      timeout: 10000,
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
    await page.waitForTimeout(500);

    await page
      .getByLabel('Room Name', { exact: false })
      .fill('Private Link Test');
    await page.getByRole('button', { name: /Public|Private/i }).click();

    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Create Room' }).click();

    await expect(page).toHaveURL(/\/games\/rooms\//, { timeout: 20000 });
    const inviteUrl = page.url();
    const roomId = inviteUrl.match(/\/games\/rooms\/([^/?]+)/)?.[1];

    await page.waitForTimeout(1500);
    const roomInviteUrl = await page.evaluate(() => window.location.href);

    const newPage = await context.newPage();
    await newPage.goto(roomInviteUrl);

    await expect(newPage.getByText('Joining...')).not.toBeVisible({
      timeout: 10000,
    });
    await expect(newPage.getByRole('button', { name: /Exit/i })).toBeVisible({
      timeout: 10000,
    });
    await expect(
      newPage.getByText(/Waiting for host/i).or(newPage.getByText(/Lobby/i)),
    ).toBeVisible();

    createdRoomId = roomId ?? null;
    anonymousId = await newPage.evaluate(() =>
      localStorage.getItem('aico_anon_id'),
    );
  });
});
